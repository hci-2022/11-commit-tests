var html = document.querySelector('html');

// Add a `js` class for any JavaScript-dependent CSS
// See https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
html.classList.add('js');

if (html.id === 'create-post') {
  // Logic for post-creation form goes here
  var form = document.querySelector('form[name="post"]');
  restoreFormDataFromLocalStorage(form.name);
  form.addEventListener('input', debounce(handleFormInputActivity, 800));
  form.addEventListener('change', handleFormInputActivity);
  form.addEventListener('submit', handleFormSubmission);
}

if (html.id === 'preview-post') {
  // Logic for post preview goes here
  renderFormDataFromLocalStorage('post');
  html.addEventListener('click', function(event) {
    if (event.target.id === 'new-post') {
      event.preventDefault();
      localStorage.removeItem('post');
      window.location.href = event.target.href;
    }
  });
}

/*
  Callback Functions
*/

function handleFormInputActivity(event) {
  var inputElements = ['INPUT', 'SELECT', 'TEXTAREA'];
  var targetElement = event.target;
  if (!inputElements.includes(targetElement.tagName)) {
    return; // this is not an element we care about
  }
  // Implicit 'else', care of the `return;` statement above...
  var errorClass = targetElement.name + '-error';
  var errorEl = document.querySelector('.' + errorClass);

  if (targetElement.value.length < 3) {
    // Don't add duplicate errors
    if (!errorEl) {
      var errorText = capitalizeFirstLetter(targetElement.name) + ' must be at least 3 characters';
      errorEl = document.createElement('p');
      errorEl.className = errorClass
      errorEl.innerText = errorText;
      targetElement.before(errorEl);
    }
  } else {
    if (errorEl) {
      errorEl.remove();
    }
  }

  writeFormDataToLocalStorage(targetElement.form.name, targetElement);
}

function handleFormSubmission(event) {
  var targetElement = event.target;
  event.preventDefault(); // STOP the default browser behavior
  writeFormDataToLocalStorage(targetElement.name); // STORE all the form data
  window.location.href = targetElement.action; // PROCEED to the URL referenced by the form action
}

/*
  Core Functions
*/

function writeFormDataToLocalStorage(formName, inputElement) {
  var formData = findOrCreateLocalStorageObject(formName);

  // Set just a single input value
  if (inputElement) {
    formData[inputElement.name] = inputElement.value;
  } else {
    // Set all form input values, e.g., on a submit event
    var formElements = document.forms[formName].elements;
    for (var i = 0; i < formElements.length; i++) {
      // Don't store empty elements, like the submit button
      if (formElements[i].value !== "") {
        formData[formElements[i].name] = formElements[i].value;
      }
    }
  }

  // Write the formData JS object to localStorage as JSON
  writeJsonToLocalStorage(formName, formData);
}

function findOrCreateLocalStorageObject(keyName) {
  var jsObject = readJsonFromLocalStorage(keyName);

  if (Object.keys(jsObject).length === 0) {
    writeJsonToLocalStorage(keyName, jsObject);
  }

  return jsObject;
}

function readJsonFromLocalStorage(keyName) {
  var jsonObject = localStorage.getItem(keyName);
  var jsObject = {};

  if (jsonObject) {
    try {
      jsObject = JSON.parse(jsonObject);
    } catch(e) {
      console.error(e);
      jsObject = {};
    }
  }

  return jsObject;
}

function writeJsonToLocalStorage(keyName, jsObject) {
  localStorage.setItem(keyName, JSON.stringify(jsObject));
}

function destroyFormDataInLocalStorage(formName) {
  localStorage.removeItem(formName);
}

function restoreFormDataFromLocalStorage(formName) {
  var jsObject = readJsonFromLocalStorage(formName);
  var formValues = Object.entries(jsObject);
  if (formValues.length === 0) {
    return; // nothing to restore
  }
  var formElements = document.forms[formName].elements;
  for (var i = 0; i < formValues.length; i++) {
    console.log('Form input key:', formValues[i][0], 'Form input value:', formValues[i][1]);
    formElements[formValues[i][0]].value = formValues[i][1];
  }
}

function renderFormDataFromLocalStorage(storageKey) {
  var jsObject = readJsonFromLocalStorage(storageKey);
  var formValues = Object.entries(jsObject);
  if (formValues.length === 0) {
    return; // nothing to restore
  }
  var previewElement = document.querySelector('#post');
  for (var i = 0; i < formValues.length; i++) {
    var el = previewElement.querySelector('#'+formValues[i][0]);
    el.innerText = formValues[i][1];
  }
}

/*
  Utility Functions
*/

function capitalizeFirstLetter(string) {
  var firstLetter = string[0].toUpperCase();
  return firstLetter + string.substring(1);
}

// debounce to not execute until after an action has stopped (delay)
function debounce(callback, delay) {
  var timer; // function-scope timer to debounce()
  return function() {
    var context = this; // track function-calling context
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
    var args = arguments; // hold onto arguments object
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments

    // Reset the timer
    clearTimeout(timer);

    // Set the new timer
    timer = setTimeout(function() {
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
      callback.apply(context, args);
    }, delay);
  }
}

// throttle to slow execution to a certain amount of elapsed time (limit)
function throttle(callback, limit) {
  var throttling; // function-scope boolean for testing throttle state
  return function() {
    var context = this; // track function-calling context
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
    var args = arguments; // hold onto arguments object
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments

    // Run the function if not currently throttling
    if (!throttling) {
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
      callback.apply(context, args);
      throttling = true;
      setTimeout(function() {
        throttling = false;
      }, limit);
    }
  }
}
