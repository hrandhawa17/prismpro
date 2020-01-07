import React, { Component } from 'react';
import axios from "axios";

// Components
import {
  Table,
  Alert,
  InputPlusLabel,
  ElementPlusLabel,
  StackingLayout,
  Button,
  ConfirmModal,
  Paragraph,
  Input

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
import { Fragment } from 'react';


class TicketPage extends Component {

  constructor(props) {
    super(props);
    
    this.validate = this.validate.bind(this);
    

    this.columns = [
      {
        title: 'Creation Time',
        key: 'creation_time',
        render: (creation_time) => {
          let dt = new Date(creation_time);
          return <Paragraph> {dt.toLocaleDateString()+ " " + dt.toLocaleTimeString()}</Paragraph>
        }
      },
      {
        title: 'Task ID',
        key: 'key',
      },
      {
        title: 'Task Status',
        key: 'task_status',
      },
      {
        title: 'Alert Name',
        key: 'alert_name',
      },
      {
        title: 'Alert ID',
        key: 'alert_id'
      },
      {
        title: 'VM Name',
        key: 'vm_name'
      },
      {
        title: 'VM ID',
        key: 'vm_id'
      }
    ];

    this.state = {
      ticketData: [],
      visible: false,
      inputVal: '',
      error: false,
      showSuccessBanner: false,
      rowData: null
    };
  }

  modalErrorAlert = <Alert type="error" inline={true} message="Oh snap! Change a few things up and try submitting again." />;
  successAlert = <Alert type="success" inline={false} message="Ticket resolved successfully!" />;

  componentDidMount() {

    const options = {
      method: 'GET',
      url: 'gettickets'
    }
    basicFetch(options)
      .then(res => {
        for (var prop in res.data.tickets[0]) {
          console.log(prop, res.data.tickets[0][prop]);
        }
        this.setState({
          ticketData: res.data.tickets
        })
      })

  }

  validate() {
    console.log("in validate", this.state)
    const { pcIp, ppvmIp, password, selectedPlaybook, rowData } = this.state;

    // initiate script
    this.setState({ loading: true });

    if (pcIp === null || password === null || ppvmIp === null) {
      this.setState({
        error: true,
        showSuccessBanner: false
      });
      return;
    }
    else {
      return basicFetch({
        url: `/api/nutanix/v3/action_rules/trigger/`,
        method: 'POST',
        data: JSON.stringify({
          ppvmIp: ppvmIp,
          selectedPlaybookUUID: selectedPlaybook.uuid,
          vm_id: rowData.vm_id,
          password: password
        })
      }).then(resp => {
        if (resp && resp.stderr) {
          this.setState({
            error: resp.stderr,
            loading: false
          });
        } else {
          this.setState({
            error: false,
            visible: false,
            showSuccessBanner: true
          });
        }
      });
    }

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
        label={'Select the Playbook to Trigger'}
        element={
          <EntitySearch
            onEntitiesChange={
              selectedPlaybook => {
                console.log("selected playbook", selectedPlaybook)
                this.setState({ selectedPlaybook })
              }
            }
            selectedEntities={this.state.selectedPlaybook}
            placeholder='Type to search for a Playbook'
            entityType="action_rule"
            nameAttr="name"
            pcIp={pcIp}
            password={password}
            onError={() => console.error('TODO do something if there is an error')}
          />
        }
      />
    );
  }


  handleRowAction(key, rowData) {
    // alert(rowData.vm_id);
    this.setState({ rowData, visible:true });

  }


  renderTicketsInTable() {
    const { pcIp, ppvmIp, password } = this.state;
    const isValidPcIp = isValidIP(pcIp);

    return (
      <div>
        <StackingLayout>
          <ConfirmModal
            visible={this.state.visible}
            onConfirm={this.validate}
            confirmTitle="Resolve Ticket"
            confirmButtonLabel="Submit"
            confirmButtonType="primary"
            alignContent="left"
            confirmText={
              <StackingLayout>
                {this.state.error ? this.modalErrorAlert : null}
  
                <InputPlusLabel
                  error={pcIp && !isValidPcIp}
                  onChange={e => this.setState({ pcIp: e.target.value })}
                  value={pcIp}
                  id="pcIP3"
                  label="Prism Central IP Address"
                  placeholder="Enter your Prism Central IP Address"
                  helpText={pcIp && !isValidPcIp ? 'Enter a Valid IP Address' : ''}
                />
                <InputPlusLabel
                  onChange={e => this.setState({ password: e.target.value })}
                  id="password"
                  value={password}
                  label="Prism Central Password"
                  placeholder="Enter your Prism Central Password"
                  type="password"
                />
                {this.renderEntityPicker()}
                <InputPlusLabel
                  error={ppvmIp && !isValidIP(ppvmIp)}
                  onChange={e => this.setState({ ppvmIp: e.target.value })}
                  id="ppvmIP"
                  label="PrismProServer IP Address"
                  placeholder="Enter the IP Address of the PrismProServer VM"
                  helpText={ppvmIp && !isValidIP(ppvmIp) ? 'Enter a Valid IP Address' : ''}
                />
              </StackingLayout>
            }
          />
        </StackingLayout>
     
      <Table oldTable={false} loading={false} dataSource={this.state.ticketData} columns={this.columns}
        rowAction={{
          actions: (rowData) => {
            return [
              {
                key: 'custom',
                value: `Resolve Ticket`
              }
            ]
          },
          onRowAction: this.handleRowAction.bind(this),
          //getPopupContainer:()=>document.getElementById('test')
        }} />
         </div>
    );
  }

  render() {
    return (
      <StackingLayout>
        {this.state.showSuccessBanner ? this.successAlert : null}
        {this.renderTicketsInTable()}
      </StackingLayout>
    );
  }
}

export default TicketPage;



