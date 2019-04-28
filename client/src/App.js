import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
//import Tesseract from 'tesseract.js';
import { Column, Row } from 'simple-flexbox';
import DoubleButton from './Cal';

import ApiCalendar from 'react-google-calendar-api';

var Tesseract = window.Tesseract;
var resultlol = '';
var globalData = '';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: '',
      imageViewer: '',
      imgResult: '',
      imgNothing: ''
    };
  }

  showOutput = () => {
    this.setState({
      imgNothing: 'false'
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    let myImg = this.state.image;
    console.log('in handle submit image', myImg);
    Tesseract.recognize(myImg)
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
        const auth = 'Bearer ' + 'O452CCOVZEVXDFLSBCBQKGAEZA7OYPDT';
        fetch(uri, { headers: { Authorization: auth } })
          .then(res => res.json())
          .then(res => {
            globalData = res;
            console.log(globalData);
            if (globalData.entities.datetime)
              console.log('time :', globalData.entities.datetime[0].value);
            if (globalData.entities.location)
              console.log('location: ', globalData.entities.location[0].value);
            if (globalData.entities.agenda_entry)
              console.log(
                'Agenda: ',
                globalData.entities.agenda_entry[0].value
              );
          })
          .then(res => {
            const dateTime = globalData.entities.datetime[0].value;
            const event = {
              start: { dateTime },
              end: { dateTime }
            };

            ApiCalendar.createEvent(event, 'primary')
              .then(result => {
                console.log(result);
              })
              .catch(error => {
                console.log(error);
              });
          });
      });

    this.setState({
      imgResult: resultlol,
      imgNothing: ''
    });
  };

  imageChange = e => {
    e.preventDefault();
    let reader = new FileReader();
    let image = e.target.files[0];
    reader.onloadend = () => {
      this.setState({
        image,
        imageViewer: reader.result
      });
    };
    reader.readAsDataURL(image);
  };

  render() {
    let imageViewer = this.state.imageViewer;
    let $imageViewer = null;
    if (imageViewer) {
      $imageViewer = (
        <div className="bg">
          <img src={imageViewer} id="preview" alt="test" />
        </div>
      );
    } else {
      $imageViewer = (
        <div>
          <br />
          <div className="previewText">
            Select an image and then click upload image!
          </div>
        </div>
      );
    }
    return (
      <Column flexGrow={1}>
        <div className="App">
          <Row horizontal="center">
            <h2> Pic 2 Cal </h2>
          </Row>
          <Row>
            <DoubleButton />;
          </Row>
          <Row vertical="center">
            <Column flexGrow={1} horizontal="center">
              <form onSubmit={e => this.handleSubmit(e)}>
                <input
                  className="fileInput"
                  type="file"
                  onChange={e => this.imageChange(e)}
                />

                <button
                  className="submitButton"
                  type="submit"
                  onClick={e => this.handleSubmit(e)}
                >
                  Upload Image
                </button>

                <br />
                <br />

                <button
                  className="submitButton"
                  type="submit"
                  onClick={() => this.showOutput()}
                >
                  Show output(approx after 10 seconds of uploading image.)
                </button>
              </form>
            </Column>
          </Row>

          <div className="imgPreview">{$imageViewer}</div>

          <p>(Check console for progress and output)</p>

          <h2>Result</h2>
          {this.state.imgResult}
        </div>
        {/* <FetchDemo text={this.state.imgResult} /> */}
      </Column>
    );
  }
}

export default App;
