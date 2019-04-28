import React from 'react';
import './App.css';
import { Column, Row } from 'simple-flexbox';

import ApiCalendar from 'react-google-calendar-api';
import ClientId from './configkey.js'


var Tesseract = window.Tesseract;
var resultlol = '';
var globalData = '';
var imageView;
var image;
var summary;
var dateTime;
var location;

class CalendarForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      summary,
      location,
      start: {
        dateTime
      }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    if (name === 'start') {
      this.setState({
        start: { dateTime: target.value }
      });
    }
    this.setState({
      [name]: target.value
    });
  }

  handleSubmit(event) {
    //alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
    const addEvent = {
      summary: this.state.summary,
      location: this.state.location,
      start: this.state.start
    };
    ApiCalendar.createEvent(addEvent, 'primary')
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Event:
          <input
            name="summary"
            type="text"
            value={this.state.summary}
            onChange={this.handleInputChange}
          />
          />
        </label>
        <br />
        <label>
          Location:
          <input
            name="location"
            type="text"
            value={this.state.location}
            onChange={this.handleInputChange}
          />
        </label>
        <label>
          DateTime:
          <input
            name="start"
            type="text"
            value={this.state.start.dateTime}
            onChange={this.handleInputChange}
          />
        </label>
      </form>
    );
  }
}

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
        <button
          className="myButton"
          onClick={e => {
            this.handleItemClick(e, 'sign-in');
            this.props.toggle();
          }}
        >
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
      this.props.toggle();
    }
  }
  render() {
    return (
      <div>
        <button
          className="myButton"
          onClick={e => this.handleItemClick(e, 'sign-out')}
        >
          sign-out
        </button>
      </div>
    );
  }
}

const HeaderComponent = props => {
  return (
    <div id="header">
      <div>
        <h4> Snap-Event </h4>
      </div>
      <div id="log">
        {props.log ? (
          <Logout toggle={props.toggle} />
        ) : (
          <Login toggle={props.toggle} />
        )}
      </div>
    </div>
  );
};

class InputComponent extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.toggle();
    //console.log('in handle submit image', myImg);
    Tesseract.recognize(image)
      .progress(function(p) {
        //console.log('progress... ', p);
      })
      .then(function(result) {
        console.log('result is', result.text);
      })
      .finally(function(result) {
        resultlol = result.text;
        const q = encodeURIComponent(resultlol);
        const uri = 'https://api.wit.ai/message?q=' + q;
        const auth = 'Bearer ' + ClientId;
        fetch(uri, { headers: { Authorization: auth } })
          .then(res => res.json())
          .then(res => {
            globalData = res;
            if (globalData.entities.datetime)
              dateTime = globalData.entities.datetime[0].value;
            if (globalData.entities.location)
              location = globalData.entities.location[0].value;
            if (globalData.entities.agenda_entry)
              summary = globalData.entities.agenda_entry[0].value;
          });
      });
  }
  imageChange = e => {
    e.preventDefault();
    let reader = new FileReader();
    image = e.target.files[0];
    reader.onloadend = () => {
      imageView = reader.result;
    };
    reader.readAsDataURL(image);
  };
  render() {
    return (
      <div id="initial">
        <Column>
          <div className="previewText">
            Select an image and then click upload image!
          </div>
          <Row>
            <form onSubmit={e => this.handleSubmit(e)}>
              <input
                className="button"
                type="file"
                onChange={e => this.imageChange(e)}
              />
              <button
                className="button"
                type="submit"
                onClick={e => this.handleSubmit(e)}
              >
                Upload Image
              </button>
            </form>
          </Row>
        </Column>
      </div>
    );
  }
}

export default class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoggedin: false,
      imageUploaded: false,
      textReceived: false
    };
    this.logInout = this.logInout.bind(this);
    this.imageStatus = this.imageStatus.bind(this);
    this.textFlag = this.textFlag.bind(this);
  }
  logInout() {
    this.setState({
      isLoggedin: !this.state.isLoggedin
    });
  }
  imageStatus() {
    this.setState({
      imageUploaded: !this.state.imageUploaded
    });
  }
  textFlag() {
    this.setState({
      textReceived: !this.state.textReceived
    });
  }

  render() {
    return (
      <div id="main">
        <section>
          <HeaderComponent log={this.state.isLoggedin} toggle={this.logInout} />
          <div id="container">
            {this.state.isLoggedin ? (
              this.state.imageUploaded ? (
                !this.state.textReceived ? (
                  <div className="bg">
                    <img src={imageView} id="preview" alt="test" />
                    <br />
                    ...Processing Image
                  </div>
                ) : (
                  <CalendarForm />
                )
              ) : (
                <InputComponent
                  flag={this.textFlag}
                  toggle={this.imageStatus}
                />
              )
            ) : (
              <div className="box">'Please sign-in with google account'</div>
            )}
          </div>
        </section>
      </div>
    );
  }
}
