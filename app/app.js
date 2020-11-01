var DEBUG = true;
var API = "http://" + SERVER + ":3600/";
var BROKER = SERVER;

var mqtt;

const MOTOR_1_ID = 0;
const MOTOR_2_ID = 1;

var cmdEnum = {
  CMD_MANUAL: 0,
  CMD_HOME: 1,
};

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  debug("Mqtt client connected");
  // client.subscribe("World");
  // message = new Paho.MQTT.Message("Hello");
  // message.destinationName = "World";
  // client.send(message);
}

function sendManualCMD(deviceId) {
  var token = window.localStorage.getItem("accessToken", token);
  var type = window.localStorage.getItem("tokenType", type);
  var access = type + " " + token;

  var payload = {
    type: "CMD",
    cmd: cmdEnum.CMD_MANUAL,
    jwt: access,
    data: {
      M1_RUN: parseInt($(`input[name=${deviceId}-m1Run]:checked`).val()),
      M1_DIR: parseInt($(`input[name=${deviceId}-m1Dir]:checked`).val()),
      M2_RUN: parseInt($(`input[name=${deviceId}-m2Run]:checked`).val()),
      M2_DIR: parseInt($(`input[name=${deviceId}-m2Dir]:checked`).val()),
      M1_FREQ: parseInt($(`#${deviceId}-m1Freq`).val()),
    },
  };

  debug(payload);

  message = new Paho.MQTT.Message(JSON.stringify(payload));
  message.destinationName = window.localStorage.getItem("userId") + `/${deviceId}/General`;

  console.log(message.destinationName);
  mqtt.send(message);
}

function sendHomeCMD(deviceId) {
  var token = window.localStorage.getItem("accessToken", token);
  var type = window.localStorage.getItem("tokenType", type);
  var access = type + " " + token;

  var payload = {
    type: "CMD",
    cmd: cmdEnum.CMD_HOME,
    jwt: access,
    data: {
      motor: parseInt($(`input[name=${deviceId}-home]:checked`).val()),
    },
  };

  debug(payload);

  message = new Paho.MQTT.Message(JSON.stringify(payload));
  message.destinationName = window.localStorage.getItem("userId") + `/${deviceId}/General`;

  console.log(message.destinationName);
  mqtt.send(message);
}

function debug(output) {
  if (DEBUG) {
    console.log(output);
  }
}

function postRequest(endpoint, payload, header, success, failure, showLoading) {
  if (showLoading) {
    $("#loading").show();
  }
  debug(payload);
  debug(header);

  $.ajax({
    headers: header,
    url: API + endpoint,
    type: "POST",
    data: JSON.stringify(payload),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    statusCode: {
      404: function () {
        console.log("-1-1-1-1 WE GOT 404!");
      },
      200: function () {
        console.log("-1-1-1-1 WE GOT 200!");
      },
    },
    success: function (response) {
      $("#loading").hide();
      debug(response);

      success(response);
    },
    error: function (response) {
      debug("status:" + response.status + "text:" + response.responseText);
      var response = {
        status: response.status,
        message: response.statusText,
      };
      $("#loading").hide();
      debug(response);
      failure(response);
    },
  });
}

function getRequest(endpoint, payload, header, success, failure, showLoading) {
  if (showLoading) {
    $("#loading").show();
  }
  debug(payload);
  debug(header);

  $.ajax({
    headers: header,
    url: API + endpoint,
    type: "GET",
    data: JSON.stringify(payload),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    statusCode: {
      404: function () {
        console.log("-1-1-1-1 WE GOT 404!");
      },
      200: function () {
        console.log("-1-1-1-1 WE GOT 200!");
      },
    },
    success: function (response) {
      $("#loading").hide();
      debug(response);

      success(response);
    },
    error: function (response) {
      debug("status:" + response.status + "text:" + response.responseText);
      var response = {
        status: response.status,
        message: response.statusText,
      };
      $("#loading").hide();
      debug(response);
      failure(response);
    },
  });
}

function closeDraw() {
  $(".mdl-layout__drawer").toggleClass("is-visible");
  $(".mdl-layout__obfuscator").toggleClass("is-visible");
  $("#app-main").scrollTop(0);
}

/*
Returns string with invlaid chars removed and first letter uppercase
*/
function validCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/*
Check password strength
*/
function validPassword(str) {
  if (str.length < 8) {
    return "Password must be 8-20 characters";
  } else if (str.length > 20) {
    return "Password must be 8-20 characters";
  } else if (str.search(/\d/) == -1) {
    return "Password must have letters and numbers";
  } else if (str.search(/[a-zA-Z]/) == -1) {
    return "Password must have letters and numbers";
  } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
    return "Password must not have invalid characters";
  }
  return "ok";
}

function resetAuthPage() {
  $("#auth-signin-email").val(null);
  $("#auth-signin-password").val(null);
  $("#auth-signup-email").val(null);
  $("#auth-signup-password").val(null);
  $("#auth-signup-confirm").val(null);

  $("#auth-signin-  email").parent().removeClass("is-dirty");
  $("#auth-signin-password").parent().removeClass("is-dirty");
  $("#auth-signup-email").parent().removeClass("is-dirty");
  $("#auth-signup-password").parent().removeClass("is-dirty");
  $("#auth-signup-confirm").parent().removeClass("is-dirty");
}

function changePage(name) {
  var pages = $(".mdl-layout__tab-panel");

  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove("is-active");
    debug("Page change: " + name);

    if (pages[i].getAttribute("id") == name) {
      pages[i].classList.add("is-active");
    }
  }
}

function launchApp(response) {
  if (response.tokenType) {
    window.localStorage.setItem("tokenType", response.tokenType);
    window.localStorage.setItem("accessToken", response.accessToken);
    window.localStorage.setItem("userId", response.userId);
  }

  mqtt = new Paho.MQTT.Client(BROKER, 8888, window.localStorage.getItem("userId"));
  // connect the client
  mqtt.connect({
    onSuccess: onConnect,
    userName: window.localStorage.getItem("userId"),
    password: `${window.localStorage.getItem("tokenType")} ${window.localStorage.getItem("accessToken")}`,
  });

  resetAuthPage();

  changePage("page-devices");

  callDevices();
  // outputAccount(response);

  $("#auth").hide();
  $("#app").show();
  $(".mdl-layout__container").show();
}

function callDevices() {
  var token = window.localStorage.getItem("accessToken", token);
  var type = window.localStorage.getItem("tokenType", type);
  var access = type + " " + token;
  getRequest("device", {}, { Authorization: access }, outputDevices, debug, true);
}

function outputDevices(response) {
  $("#page-devices >section").html("");

  var output = '<div class="mdl-cell mdl-cell--12-col"><h3>My Devices</h3>';
  if (response.length > 0) {
    for (var i = 0; i < response.length; i++) {
      var device = response[i];

      console.log(device);

      var onclick = 'onclick="sendManualCMD(' + "'" + device._id + "'" + ')"';

      output += '<table id="routes-table"class="mdl-data-table mdl-js-data-table mdl-shadow--2dp"style="width: 100%">' + "<tbody>";

      output +=
        " <tr>" +
        '   <td class="mdl-data-table__cell--non-numeric" style="text-align: center; border: none" colspan="2">' +
        '     <p style="margin: 0; font-size: x-large">' +
        device.name +
        "     </p>" +
        '     <p style="margin: 0; font-size: small">Id:' +
        device._id +
        "     </p>" +
        "   </td>" +
        " </tr>" +
        " <tr>" +
        '   <td class="mdl-data-table__cell--non-numeric" style="text-align: right; border: none; width: 50%">' +
        '     <p style="margin: 0; font-size: large">Motor 1 Motion</p>' +
        "   </td>" +
        '   <td class="mdl-data-table__cell--non-numeric" style="text-align: left; border: none; width: 50%">' +
        '     <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-1">' +
        '       <input type="radio" id="' +
        device._id +
        '-1" class="mdl-radio__button" name="' +
        device._id +
        '-m1Run" value="1" ';

      output += device.status[MOTOR_1_ID].run ? "checked" : "";

      output +=
        "/>" +
        '       <span class="mdl-radio__label">Run</span>' +
        "     </label>" +
        '     <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-2">' +
        '       <input type="radio" id="' +
        device._id +
        '-2" class="mdl-radio__button" name="' +
        device._id +
        '-m1Run" value="0"';

      output += device.status[MOTOR_1_ID].run ? "" : "checked";

      output +=
        "/>" +
        '       <span class="mdl-radio__label">Stop</span>' +
        "     </label>" +
        "    </td>" +
        "  </tr>" +
        "  <tr>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: right; border: none; width: 50%">' +
        '      <p style="margin: 0; font-size: large">Motor 1 Direction</p>' +
        "    </td>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: left; border: none; width: 50%">' +
        '      <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-3">' +
        '        <input type="radio" id="' +
        device._id +
        '-3" class="mdl-radio__button" name="' +
        device._id +
        '-m1Dir" value="1" ';

      output += device.status[MOTOR_1_ID].dir ? "checked" : "";

      output +=
        "/>" +
        '        <span class="mdl-radio__label">Expand</span>' +
        "      </label>" +
        '      <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-4">' +
        '        <input type="radio" id="' +
        device._id +
        '-4" class="mdl-radio__button" name="' +
        device._id +
        '-m1Dir" value="0" ';
      output += device.status[MOTOR_1_ID].dir ? "" : "checked";

      output +=
        "/>" +
        '        <span class="mdl-radio__label">Contract</span>' +
        "      </label>" +
        "    </td>" +
        "  </tr>" +
        " <tr>" +
        '   <td class="mdl-data-table__cell--non-numeric" style="text-align: right; border: none; width: 50%">' +
        '     <p style="margin: 0; font-size: large">Motor 2 Motion</p>' +
        "   </td>" +
        '   <td class="mdl-data-table__cell--non-numeric" style="text-align: left; border: none; width: 50%">' +
        '     <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-5">' +
        '       <input type="radio" id="' +
        device._id +
        '-5" class="mdl-radio__button" name="' +
        device._id +
        '-m2Run" value="1" ';
      output += device.status[MOTOR_2_ID].run ? "checked" : "";

      output +=
        "/>" +
        '       <span class="mdl-radio__label">Run</span>' +
        "     </label>" +
        '     <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-6">' +
        '       <input type="radio" id="' +
        device._id +
        '-6" class="mdl-radio__button" name="' +
        device._id +
        '-m2Run" value="0"';
      output += device.status[MOTOR_2_ID].run ? "" : "checked";

      output +=
        "/>" +
        '       <span class="mdl-radio__label">Stop</span>' +
        "     </label>" +
        "    </td>" +
        "  </tr>" +
        "  <tr>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: right; border: none; width: 50%">' +
        '      <p style="margin: 0; font-size: large">Motor 2 Direction</p>' +
        "    </td>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: left; border: none; width: 50%">' +
        '      <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-7">' +
        '        <input type="radio" id="' +
        device._id +
        '-7" class="mdl-radio__button" name="' +
        device._id +
        '-m2Dir" value="1" ';
      output += device.status[MOTOR_2_ID].dir ? "checked" : "";

      output +=
        " />" +
        '        <span class="mdl-radio__label">Expand</span>' +
        "      </label>" +
        '      <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-8">' +
        '        <input type="radio" id="' +
        device._id +
        '-8" class="mdl-radio__button" name="' +
        device._id +
        '-m2Dir" value="0" ';
      output += device.status[MOTOR_2_ID].dir ? "" : "checked";

      output +=
        "/>" +
        '        <span class="mdl-radio__label">Contract</span>' +
        "      </label>" +
        "    </td>" +
        "  </tr>" +
        "  <tr>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: right; border: none; width: 50%">' +
        '      <button onclick="sendHomeCMD(' +
        "'" +
        device._id +
        "'" +
        ')" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">Home</button>' +
        "    </td>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: left; border: none; width: 50%">' +
        '      <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-9">' +
        '        <input type="radio" id="' +
        device._id +
        '-9" class="mdl-radio__button" name="' +
        device._id +
        '-home" value="0" checked />' +
        '        <span class="mdl-radio__label">Motor 1</span>' +
        "      </label>" +
        '      <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="' +
        device._id +
        '-10">' +
        '        <input type="radio" id="' +
        device._id +
        '-10" class="mdl-radio__button" name="' +
        device._id +
        '-home" value="1" />' +
        '        <span class="mdl-radio__label">Motor 2</span>' +
        "      </label>" +
        "    </td>" +
        "  </tr>" +
        "  <tr>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: right; border: none; width: 50%">' +
        '      <p style="margin: 0; font-size: large">Motor Freq (Hz)</p>' +
        "    </td>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: left; border: none; width: 50%">' +
        '      <form action="#">' +
        '        <div class="mdl-textfield mdl-js-textfield">' +
        '          <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(.[0-9]+)?" id="' +
        device._id +
        '-m1Freq" value="' +
        device.status[MOTOR_1_ID].freq +
        '" />' +
        '          <label class="mdl-textfield__label" for="' +
        device._id +
        '-m1Freq">Number...</label>' +
        '          <span class="mdl-textfield__error">Input is not a number!</span>' +
        "        </div>" +
        "      </form>" +
        "    </td>" +
        "  </tr>" +
        "  <tr>" +
        '    <td class="mdl-data-table__cell--non-numeric" style="text-align: center; border: none" colspan="2">' +
        "      <button " +
        onclick +
        ' class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">Send CMD</button>' +
        "    </td>" +
        "  </tr>";

      output += "</tbody>" + "</table>";
    }
  } else {
    output += "<p>No Devices</p>";
  }

  output += "</div>";
  $("#page-devices >section").html(output);
  componentHandler.upgradeDom();
  $(".mdl-layout__container").show();
}

function authError(response) {
  window.localStorage.clear();
  $("#auth-error").html(response.message);
}

function signOut() {
  window.localStorage.clear();
  $("#auth").show();
  $("#app").hide();
  $(".mdl-layout__container").hide();
}

$("#auth-signout-button").click(function () {
  signOut();
});

$("#auth-signin-button").click(function () {
  var email = $("#auth-signin-email").val();
  var password = $("#auth-signin-password").val();

  if (email && password) {
    postRequest("auth", { email: email, password: password }, {}, launchApp, authError, true);
  } else {
    $("#auth-error").html("Missing fields");
  }
});

$("#auth-signup-button").click(function () {
  var firstName = $("#auth-signup-first-name").val();
  var lastName = $("#auth-signup-last-name").val();
  var email = $("#auth-signup-email").val();
  var password = $("#auth-signup-password").val();
  var confirm = $("#auth-signup-confirm").val();

  if (firstName && lastName && email && password && confirm) {
    if (firstName == validCase(firstName) && lastName == validCase(lastName)) {
      if (password == confirm) {
        if (validPassword(password) == "ok") {
          postRequest(
            "users",
            {
              firstName: firstName,
              lastName: lastName,
              email: email,
              password: password,
            },
            {},
            launchApp,
            authError,
            true
          );
        } else {
          $("#auth-error").html(validPassword(password));
        }
      } else {
        $("#auth-error").html("Passwords don't match");
      }
    } else {
      $("#auth-error").html("Name must be correct case eg. " + validCase(name));
    }
  } else {
    $("#auth-error").html("Missing fields");
  }
});

// Logs you in when document loads if the token is already saved
$(document).ready(function () {
  var token = window.localStorage.getItem("accessToken", token);
  var type = window.localStorage.getItem("tokenType", type);

  if (token == null || type == null || token == undefined || type == undefined) {
  } else {
    var access = type + " " + token;
    postRequest("auth/valid", {}, { Authorization: access }, launchApp, authError, true);
  }
});
