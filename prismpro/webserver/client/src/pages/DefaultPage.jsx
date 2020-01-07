import React, { Component } from 'react';

// Components
import {
  Title,
  Modal,
  InputPlusLabel,
  StackingLayout,
  ElementPlusLabel,
  Button,
  Steps,
  Loader,
  TextLabel,
  Alert,
  Link
} from 'prism-reactjs';

import EntitySearch from '../components/EntitySearch.jsx';

// Utils
import {
  basicFetch,
  getErrorMessage
} from '../utils/FetchUtils';
import {
  isValidIP
} from '../utils/AppUtil';

class DefaultPage extends Component {

  state = {
    step: 0
  };

  renderModalHeader() {
    return (
      <div className="modal-title-container">
      <Title size="h3">Prism Pro Lab</Title>
      </div>
    );
  }

  onVMSearchErr = (e) => {
    if (e && e.message === 'AUTHENTICATION_REQUIRED') {
      this.setState({
        error: 'Failed to authenticate using default password. Please enter your PC Password to continue.'
      });
    } else {
      this.setState({
        error: e
      });
    }
  }

  renderStep1() {
    console.log("start of renderstep1", this.state)
    const { pcIp, ppvm, ppvmIp, password } = this.state;
    console.log("second step in renderstep1", { pcIp, ppvm, ppvmIp, password })
    const isValidPcIp = isValidIP(pcIp);    
    return (
      <StackingLayout>
        <Title size="h3">Setup: Initialize Server</Title>
        <div><TextLabel type={TextLabel.TEXT_LABEL_TYPE.SECONDARY}>The PrismProServer needs to be initialized in order to begin. Start by entering the Prism Central IP address and selecting the PrismProServer VM.</TextLabel></div>
        <InputPlusLabel
          error={ pcIp && !isValidPcIp }
          onChange={e => this.setState({ pcIp : e.target.value }) }
          id="pcIP"
          value={ pcIp }
          label="Prism Central IP Address"
          placeholder="Enter your Prism Central IP Address"
          helpText={ pcIp && !isValidPcIp ? 'Enter a Valid IP Address' : '' }
        />
        <InputPlusLabel
          onChange={e => this.setState({ password : e.target.value }) }
          id="password"
          value={ password }
          label="Prism Central Password"
          placeholder="Enter your Prism Central Password"
          type="password"
        />
        { this.renderEntityPicker('Select the PrismProServer VM', ' ', true) }
        { ppvm && !isValidIP(ppvm.ip) ? (
          <InputPlusLabel
            error={ ppvmIp && !isValidIP(ppvmIp) }
            onChange={e => this.setState({ ppvmIp : e.target.value }) }
            id="ppvmIP"
            label="PrismProServer IP Address"
            placeholder="Enter the IP Address of the PrismProServer VM"
            helpText={ ppvmIp && !isValidIP(ppvmIp) ? 'Enter a Valid IP Address' : '' }
          />
        ) : null }
      </StackingLayout>
    );
  }

  renderStep2() {
    const { ppvm, ppvmIp } = this.state;
    const ip = (ppvm && ppvm.ip) || ppvmIp;
    return (
      <StackingLayout>
        { ip ? <Title size="h3">Launch the PrismProServer by clicking <Link target="_blank" href={ `http://${ip}/` }>here</Link></Title> : null }
        <div><TextLabel type={TextLabel.TEXT_LABEL_TYPE.SECONDARY}>Return to the lab document and follow the instructions. When the lab instructions tell you to proceed to the next step, click the 'Continue' button.</TextLabel></div>
      </StackingLayout>
    );
  }

  renderStep3() {
    const { pcIp, password } = this.state;
    const isValidPcIp = isValidIP(pcIp);
    return (
      <StackingLayout>
        <Title size="h3">Story 4: Simulate VM Memory Constrained Alert</Title>
        <div><TextLabel type={TextLabel.TEXT_LABEL_TYPE.SECONDARY}>Now we will simulate a Memory Constrained alert for your VM.</TextLabel></div>
        <InputPlusLabel
          error={ pcIp && !isValidPcIp }
          onChange={e => this.setState({ pcIp : e.target.value }) }
          id="pcIP2"
          value={ pcIp }
          label="Prism Central IP Address"
          placeholder="Enter your Prism Central IP Address"
          helpText={ pcIp && !isValidPcIp ? 'Enter a Valid IP Address' : '' }
        />
        <InputPlusLabel
          onChange={e => this.setState({ password : e.target.value }) }
          id="password"
          value={ password }
          label="Prism Central Password"
          placeholder="Enter your Prism Central Password"
          type="password"
        />
        { this.renderEntityPicker() }
      </StackingLayout>
    );
  }

  renderStep4() {
    const { pcIp, password } = this.state;
    const isValidPcIp = isValidIP(pcIp);
    return (
      <StackingLayout>
        <Title size="h3">Story 5: Simulate VM Bully Detected Alert</Title>
        <div><TextLabel type={TextLabel.TEXT_LABEL_TYPE.SECONDARY}>Now we will simulate a Bully Detected alert for your VM.</TextLabel></div>
        <InputPlusLabel
          error={ pcIp && !isValidPcIp }
          onChange={e => this.setState({ pcIp : e.target.value }) }
          value={ pcIp }
          id="pcIP3"
          label="Prism Central IP Address"
          placeholder="Enter your Prism Central IP Address"
          helpText={ pcIp && !isValidPcIp ? 'Enter a Valid IP Address' : '' }
        />
        <InputPlusLabel
          onChange={e => this.setState({ password : e.target.value }) }
          id="password"
          value={ password }
          label="Prism Central Password"
          placeholder="Enter your Prism Central Password"
          type="password"
        />
        { this.renderEntityPicker() }
      </StackingLayout>
    );
  }

  renderEntityPicker(label, helpText, isPPVM) {    
    const { pcIp, password } = this.state;
    const isValidPcIp = isValidIP(pcIp);
    const attr = isPPVM ? 'ppvm' : 'vm';
    if (!isValidPcIp || !password) {
      return null;
    }
    return (
      <ElementPlusLabel
        label={ label || 'Select your VM'}
        element={
          <EntitySearch
            onEntitiesChange={ selectedvm => this.setState({ [attr] : selectedvm }) }
            selectedEntities={ this.state[attr] }
            placeholder='Type to search for a VM'
            entityType="vm"
            pcIp={ pcIp }
            password={ password }
            onError={ this.onVMSearchErr }
          />
        }
        helpText={ helpText || 'Choose the VM that you created for this lab'}
      />
    );
  }

  renderBody() {
    const steps = [
      { title: 'Setup', content: this.renderStep1(), key: '1' },
      { title: 'Story 1-3', content: this.renderStep2(), key: '2' },
      { title: 'Story 4', content: this.renderStep3(), key: '3' },
      { title: 'Story 5', content: this.renderStep4(), key: '4' }
    ];
    return (
      <Steps
        steps={ steps }
        currentStep={ this.state.step }
        contentWidth={ 420 }
      />
    );
  }

  getButtonText() {
    const { step } = this.state;
    switch(step) {
      case 0:
        return 'Begin Setup';
      case 1:
        return 'Continue';
      case 2:
        return 'Simulate Alert';
      case 3:
        return 'Simulate Alert';
      default:
        return 'Next';
    }
  }

  completeCurrentStep() {
    
    const { step, pcIp, ppvmIp, ppvm, password } = this.state;
    this.setState({
      loading: false,
      error: false,
      showAlertSuccess: false
    });
    switch(step) {
      case 0:
        const uvmIp = (ppvm && isValidIP(ppvm.ip) && ppvm.ip) || ppvmIp;
        // initiate script
        this.setState({ loading: true });
        basicFetch({
          url: `begin/`,
          method: 'POST',
          data: JSON.stringify({
            pcIp: pcIp,
            vmIp: uvmIp,
            vmId: ppvm && ppvm.uuid,
            vmName: ppvm && ppvm.name,
            password
          })
        }).then(resp => {
          if (resp && resp.stderr) {
            this.setState({
              error: resp.stderr,
              loading: false
            });
          } else {
            this.setState({
              loading: false,
              step : 1
            });
          }
        }).catch(e => {
          console.log(e);
          this.setState({
            error: e,
            loading: false
          });
        });
        return;
      case 1:
        // Go to the next step...
        this.setState({ step : 2 });
        return;
      case 2:
        // simulate alert
        this.simulateAlert('A120241').then(resp => {
          if (resp && resp.stderr) {
            this.setState({
              error: resp.stderr,
              loading: false
            });
          } else {
            this.setState({
              loading: false,
              showAlertSuccess: true,
              step: 3              
            });
          }
        }).catch(e => {
          console.log(e)
          this.setState({
            error: e,
            loading: false
          });
        });
        return;
      case 3:
        // simulate alert
        this.simulateAlert('A120245').then(resp => {
          if (resp && resp.stderr) {
            this.setState({
              error: resp.stderr,
              loading: false
            });
          } else {
            this.setState({
              loading: false,
              showAlertSuccess: true
            });
          }
        }).catch(e => {
          console.log(e)
          this.setState({
            error: e,
            loading: false
          });
        });
        return;
      default:
        return;
    }
  }

  simulateAlert(alert_uid) {
    const { pcIp, vm, password } = this.state;
    // initiate script
    this.setState({ loading: true });
    return basicFetch({
      url: `generate_alert/${alert_uid}`,
      method: 'POST',
      data: JSON.stringify({
        pcIp: pcIp,
        vmId: vm && vm.uuid,
        vmName: vm && vm.name,
        password
      })
    });
  }

  getFooter() {
    const { step, pcIp, ppvmIp, ppvm } = this.state;
    let enabled = step === 1 || isValidIP(pcIp);
    if (step === 0 ) {
      enabled = isValidIP(pcIp) && ppvm && (isValidIP(ppvm.ip) || isValidIP(ppvmIp));
    }
    return (
      <div>
        { step === 1 ? null : (
          <Button
            type="secondary"
            onClick={() => this.setState({
              loading: false,
              error: false,
              showAlertSuccess: false,
              step: step < 3 ? step + 1 : step - 1
            })}>
            { step < 3 ? 'Skip' : 'Back' }
          </Button>
        ) }
        <Button disabled={ !enabled } type="primary" onClick={ () => this.completeCurrentStep() }>
          { this.getButtonText() }
        </Button>
      </div>
    );
  }

  renderAlerts() {
    if (this.state.error) {
      return (
        <Alert
          type={ Alert.TYPE.ERROR }
          message={ getErrorMessage(this.state.error) || 'An unknown error occurred.' }
        />
      );
    } else if (this.state.showAlertSuccess) {
      return (
        <Alert
          type={ Alert.TYPE.SUCCESS }
          message="Alert was Successfully Generated."
        />
      );
    }
    return null;
  }

  render() {
    return (
      <Modal
        width={ 500 }
        visible={ true }
        title="Modal"
        footer={ this.getFooter() }
        mask={ false }
        maskClosable={ false }
        customModalHeader={ this.renderModalHeader() }
      >
        <Loader loading={ !!this.state.loading }>
          <StackingLayout>
            { this.renderAlerts() }
            { this.renderBody() }
          </StackingLayout>
        </Loader>
      </Modal>
    );
  }
}

export default DefaultPage;
