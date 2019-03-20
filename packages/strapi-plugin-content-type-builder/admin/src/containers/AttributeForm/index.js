/**
 *
 * AttributeForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get, isEmpty } from 'lodash';
// import { connect } from 'react-redux';
// import { bindActionCreators, compose } from 'redux';

import Input from 'components/InputsIndex';

import pluginId from '../../pluginId';

import BodyModal from '../../components/BodyModal';
import ButtonModalPrimary from '../../components/ButtonModalPrimary';
import ButtonModalSecondary from '../../components/ButtonModalSecondary';
import CustomCheckbox from '../../components/CustomCheckbox';
import FooterModal from '../../components/FooterModal';
import HeaderModal from '../../components/HeaderModal';
import HeaderModalNavContainer from '../../components/HeaderModalNavContainer';
import HeaderNavLink from '../../components/HeaderNavLink';
import WrapperModal from '../../components/WrapperModal';

import supportedAttributes from './supportedAttributes.json';

const NAVLINKS = [{ id: 'base' }, { id: 'advanced' }];

class AttributeForm extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  state = { didCheckErrors: false, formErrors: {}, showForm: false };

  getCurrentForm = () => {
    const { activeTab, attributeType } = this.props;

    return get(supportedAttributes, [attributeType, activeTab, 'items'], []);
  };

  getFormErrors = () => {
    const { alreadyTakenAttributes, attributeToEditName, modifiedData } = this.props;
    const currentForm = this.getCurrentForm();
    let formErrors = {};
    const alreadyTakenAttributesUpdated = alreadyTakenAttributes.filter(
      attribute => attribute !== attributeToEditName,
    );
    if (isEmpty(modifiedData.name)) {
      formErrors = { name: [{ id: `${pluginId}.error.validation.required` }] };
    }

    if (alreadyTakenAttributesUpdated.includes(get(modifiedData, 'name', ''))) {
      formErrors = { name: [{ id: `${pluginId}.error.attribute.taken` }] };
    }

    // TODO NEED TO HANDLE OTHER VALIDATIONS
    formErrors = Object.keys(modifiedData).reduce((acc, current) => {
      const { custom, validations } = currentForm.find(input => input.name === current) || {
        validations: {},
      };
      const value = modifiedData[current];

      if (validations.required === true && value === '' && custom === true) {
        acc[current] = [{ id: `${pluginId}.error.validation.required` }];
      }

      return acc;
    }, formErrors);

    this.setState(prevState => ({
      didCheckErrors: !prevState.didCheckErrors,
      formErrors,
    }));

    return formErrors;
  };

  handleCancel = () => {
    const { push } = this.props;

    push({ search: '' });
  };

  handleGoTo = to => {
    const { actionType, attributeType, push } = this.props;

    push({
      search: `modalType=attributeForm&attributeType=${attributeType}&settingType=${to}&actionType=${actionType}`,
    });
  };

  handleOnClosed = () => {
    const { onCancel } = this.props;

    onCancel();
    this.setState({ formErrors: {}, showForm: false });
  };

  handleOnOpened = () => this.setState({ showForm: true });

  handleSubmit = () => {
    if (isEmpty(this.getFormErrors())) {
      if (this.props.actionType === 'create') {
        this.props.onSubmit();
      } else {
        this.props.onSubmitEdit();
      }
    }
  };

  handleSubmitAndContinue = e => {
    e.preventDefault();

    if (isEmpty(this.getFormErrors())) {
      if (this.props.actionType === 'create') {
        this.props.onSubmit(true);
      } else {
        this.props.onSubmitEdit(true);
      }
    }
  };

  handleToggle = () => {
    const { push } = this.props;

    push({ search: '' });
  };

  renderInput = (input, index) => {
    const { modifiedData, onChange } = this.props;
    const { didCheckErrors, formErrors } = this.state;
    const { custom, defaultValue, name } = input;
    const value = get(modifiedData, name, defaultValue);

    const errors = get(formErrors, name, []);

    if (custom) {
      return (
        <CustomCheckbox
          didCheckErrors={didCheckErrors}
          errors={errors}
          key={name}
          {...input}
          onChange={onChange}
          value={value}
        />
      );
    }

    return (
      <Input
        autoFocus={index === 0}
        didCheckErrors={didCheckErrors}
        errors={errors}
        key={name}
        {...input}
        onChange={onChange}
        value={value}
      />
    );
  };

  renderNavLink = (link, index) => {
    const { activeTab } = this.props;

    return (
      <HeaderNavLink
        isActive={activeTab === link.id}
        key={link.id}
        {...link}
        onClick={this.handleGoTo}
        nextTab={index === NAVLINKS.length - 1 ? 0 : index + 1}
      />
    );
  };

  render() {
    const { actionType, attributeToEditName, attributeType, isOpen } = this.props;
    const { showForm } = this.state;
    const currentForm = this.getCurrentForm();
    const titleContent = actionType === 'create' ? attributeType : attributeToEditName;

    return (
      <WrapperModal
        isOpen={isOpen}
        onClosed={this.handleOnClosed}
        onOpened={this.handleOnOpened}
        onToggle={this.handleToggle}
      >
        <HeaderModal>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            <FormattedMessage id={`${pluginId}.popUpForm.${actionType || 'create'}`} />
            &nbsp;
            <span style={{ fontStyle: 'italic', textTransform: 'capitalize' }}>{titleContent}</span>
            &nbsp;
            <FormattedMessage id={`${pluginId}.popUpForm.field`} />
          </div>
          <HeaderModalNavContainer>{NAVLINKS.map(this.renderNavLink)}</HeaderModalNavContainer>
        </HeaderModal>
        <form onSubmit={this.handleSubmitAndContinue}>
          <BodyModal>{showForm && currentForm.map(this.renderInput)}</BodyModal>
          <FooterModal>
            <ButtonModalSecondary message={`${pluginId}.form.button.cancel`} onClick={this.handleCancel} />
            <ButtonModalPrimary message={`${pluginId}.form.button.continue`} type="submit" add />
            <ButtonModalPrimary
              message={`${pluginId}.form.button.save`}
              type="button"
              onClick={this.handleSubmit}
            />
          </FooterModal>
        </form>
      </WrapperModal>
    );
  }
}

AttributeForm.defaultProps = {
  actionType: 'create',
  activeTab: 'base',
  attributeToEditName: '',
  alreadyTakenAttributes: [],
  attributeType: 'string',
  isOpen: false,
  modifiedData: {},
  onCancel: () => {},
  onChange: () => {},
  push: () => {},
};

AttributeForm.propTypes = {
  actionType: PropTypes.string,
  activeTab: PropTypes.string,
  alreadyTakenAttributes: PropTypes.array,
  attributeToEditName: PropTypes.string,
  attributeType: PropTypes.string,
  isOpen: PropTypes.bool,
  modifiedData: PropTypes.object, // TODO: Clearly define this object (It's working without it though)
  onCancel: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  onSubmitEdit: PropTypes.func.isRequired,
  push: PropTypes.func,
};

export default AttributeForm;