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

  _loadMap(pos){
      let {latitude , longitude} = pos.coords;
      let coords = [`${latitude}`, `${longitude}`];
      this.#map = L.map('map').setView(coords, 13);
  
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.#map);
  
    // handling click on maps
      this.#map.on('click', this._showForm.bind(this));

      this.#workouts.forEach(work=>{
        this._renderWorkoutMarker(work);
      })
  }

  _showForm(mapE){
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField(){
      inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _hideForm(){
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(()=>{
      form.style.display = 'grid';
    }, 1000);
  }

  _newWorkout(e){
    // helper methods
    const validInputs = (...inputs) => inputs.every(inp=> Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp=> inp>0);

    e.preventDefault();

    const {lat, lng} = this.#mapEvent.latlng;

    // getting the form data
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    let workout;

    // chekcing the type of workout and validating the inputs
    if(type==='running'){
      const cadence = +inputCadence.value;
      if(!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)){ alert("Input have to a postive number"); }
      workout = new Running([lat,lng], distance, duration, cadence);
    }

    if(type==='cycling'){
      const elevation = + inputElevation.value;
      if(!validInputs(distance, duration, elevation) || !allPositive(distance, duration)){
        alert("Input have to a postive number"); }
      workout = new Cycling([lat,lng], distance, duration, elevation);
    }

    // adding the runnign or cycling workout to the array
    this.#workouts.push(workout);

    // render workout on map as marker
    this._renderWorkoutMarker(workout);

    // render workout list
    this._renderWorkoutList(workout);

    // clearing the input fields after adding it to the array
    this._hideForm();

    // setting the data to local storage
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout){

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const date = today.getDate();

    L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
      minWidth : 250,
      maxWidth : 100,
      autoClose : false,
      closeOnClick : false,
      className : `${workout.type}-popup`
    })).setPopupContent(`${workout.description}`).openPopup()
  }

  _renderWorkoutList(workout){
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type ===  'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.type === 'running' ? workout.pace.toFixed(2) : workout.speed.toFixed(2)}</span>
            <span class="workout__unit">${workout.type === 'running' ? 'min/km' : 'km/h'}</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${workout.type ===  'running' ? '🦶🏼' : '⛰'}</span>
            <span class="workout__value">${workout.type === 'running' ? workout.cadence : workout.elevGain}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
    `;

    form.insertAdjacentHTML('afterend',html);
  }

  _moveToPopup(e){
    const workoutEl = e.target.closest('.workout');
    if(!workoutEl) return;

    const workout = this.#workouts.find(work=> work.id == workoutEl.dataset.id);

    this.#map.setView(workout.coords, 13, {
      animate :true,
      pan : {
        duration : 1
      }
    });
  }

  _setLocalStorage(){
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage(){
    const workout = JSON.parse(localStorage.getItem('workouts'));
    if(!workout) return;

    this.#workouts = workout;

    this.#workouts.forEach(work=> {
      this._renderWorkoutList(work);
    });


  }

  reset(){
    localStorage.removeItem('workouts');
    location.reload();
  }

}

const app = new App();