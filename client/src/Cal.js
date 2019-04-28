import React from 'react';

import ApiCalendar from 'react-google-calendar-api';
const API_KEY = '7d75b0f8744d9a79c605094e42f77c66529d90ef';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick(event, name) {
    if (name === 'sign-in') {
      ApiCalendar.handleAuthClick();
    }
  }

  render() {
    return (
      <div>
        <button onClick={e => this.handleItemClick(e, 'sign-in')}>
          sign-in
        </button>
      </div>
    );
  }
}

class Logout extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick(event, name) {
    if (name === 'sign-out') {
      ApiCalendar.handleSignoutClick();
    }
  }

  render() {
    return (
      <div>
        <button onClick={e => this.handleItemClick(e, 'sign-out')}>
          sign-out
        </button>
      </div>
    );
  }
}

export default { Login, Logout };
