'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout{
  date = new Date();
  id = Date.now();
  constructor(coords, distance, duration){
    // this.date = ...
    // this.id = ...
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in  min
  }

  _setDiscription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description= `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout{
  type='running';
  constructor(coords, distance, duration, cadence){
    super(coords, distance,duration);
    this.cadence = cadence;
    this.type='running';
    this.calcPace();
    this._setDiscription();
  }
  calcPace(){
    // min per miles
    this.pace = this.duration / this.distance*1.6;
    return this.pace;
  }
}

class Cycling extends Workout{
  type='cycling';
  constructor(coords, distance, duration, elevGain){
    super(coords, distance,duration);
    this.elevGain = elevGain;
    this.type = 'cycling';
    this.calcSpeed();
    this._setDiscription();
  }
  calcSpeed(){
    // miles per hr
    this.speed = this.distance*1.6 / this.duration/60;
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts=[]

  constructor() {
    // getting coordintates of the position
    this._getPosition();

    // get data form localstorage
    this._getLocalStorage();

    // event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function(){
        alert("Could not get your position")
      }
    )}
  }

  
}