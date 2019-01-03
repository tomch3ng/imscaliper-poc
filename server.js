var restify = require('restify');
var Caliper = require('ims-caliper');
var util = require('util');

function respond(req, res, next) {
  sendEvent();
  res.send('hello ' + req.params.name);
  next();
}

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

function sendEvent() {
  // The Actor for the Caliper Event
  var actor = new Caliper.Person("https://example.edu/user/554433");
  actor.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
  actor.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());

  // The Action for the Caliper Event
  var action = Caliper.AssessmentActions.STARTED;

  // The Object being interacted with by the Actor (Assessment)
  var eventObj = new Caliper.Assessment("https://example.edu/politicalScience/2015/american-revolution-101/assessment/001");
  eventObj.setName("American Revolution - Key Figures Assessment");
  eventObj.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());
  eventObj.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
  eventObj.setDatePublished((new Date("2015-08-15T09:30:00.000Z")).toISOString());
  eventObj.setVersion("1.0");
  eventObj.setDateToActivate((new Date("2015-08-16T05:00:00.000Z")).toISOString());
  eventObj.setDateToShow((new Date("2015-08-16T05:00:00.000Z")).toISOString());
  eventObj.setDateToStartOn((new Date("2015-08-16T05:00:00.000Z")).toISOString());
  eventObj.setDateToSubmit((new Date("2015-09-28T11:59:59.000Z")).toISOString());
  eventObj.setMaxAttempts(2);
  eventObj.setMaxSubmits(2);
  eventObj.setMaxScore(3.0);

  // The target object (frame) within the Event Object
  var target = null;

  // The generated object (Attempt) within the Event Object
  var generated = new Caliper.Attempt(eventObj['@id'] + "/attempt/5678");
  generated.setActor(actor['@id']);
  generated.setAssignable(eventObj['@id']);
  generated.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
  generated.setCount(1);
  generated.setStartedAtTime((new Date("2015-09-15T10:15:00Z")).toISOString());

  // The edApp
  var edApp = new Caliper.SoftwareApplication("https://example.com/super-assessment-tool");
  edApp.setName("Super Assessment Tool");
  edApp.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
  edApp.setDateModified(null);

  // LIS Course Offering
  var courseOffering = new Caliper.CourseOffering("https://example.edu/politicalScience/2015/american-revolution-101");
  courseOffering.setName("Political Science 101: The American Revolution");
  courseOffering.setCourseNumber("POL101");
  courseOffering.setAcademicSession("Fall-2015");
  courseOffering.setSubOrganizationOf(null);
  courseOffering.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
  courseOffering.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());

  // LIS Course Section
  var courseSection = new Caliper.CourseSection(courseOffering['@id'] + "/section/001");
  courseSection.setName("American Revolution 101");
  courseSection.setCourseNumber("POL101");
  courseSection.setAcademicSession("Fall-2015");
  courseSection.setSubOrganizationOf(courseOffering);
  courseSection.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());
  courseSection.setDateModified((new Date("2015-09-02T11:30:00Z")).toISOString());

  // LIS Group
  var group = new Caliper.Group(courseSection['@id'] + "/group/001");
  group.setName("Discussion Group 001");
  group.setSubOrganizationOf(courseSection);
  group.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());

  // The Actor's Membership
  var membership = new Caliper.Membership(courseOffering['@id'] + "/roster/554433");
  membership.setName("American Revolution 101");
  membership.setDescription("Roster entry");
  membership.setMember(actor['@id']);
  membership.setOrganization(courseSection['@id']);
  membership.setRoles([Caliper.Role.LEARNER]);
  membership.setStatus(Caliper.Status.ACTIVE);
  membership.setDateCreated((new Date("2015-08-01T06:00:00Z")).toISOString());

  // Assert that key attributes are the same
  var event = new Caliper.Event();
  event.setActor(actor);
  event.setAction(action);
  event.setObject(eventObj);
  event.setTarget(target);
  event.setGenerated(generated);
  event.setEventTime((new Date("2015-09-15T10:15:00Z")).toISOString());
  event.setEdApp(edApp);
  event.setGroup(group);
  event.setMembership(membership);

  // Create data payload
  var payload = [];
  payload.push(event);

  var sensor = Caliper.Sensor;
  sensor.initialize("http://example.org/sensors/1");

  // Override default HTTP options
  var options = Caliper.Client.HttpOptions;
  options.uri = "https://lti.tools/caliper/event";
  options.headers["Authorization"] = "40dI6P62Q_qrWxpTk95z8w";

  // Initialize and register client
  var client = Caliper.Client.HttpClient;
  client.initialize("http://example.org/sensors/1/clients/2", options);
  sensor.registerClient(client);

  // Envelope options
  var opts = {
    sensor: sensor.id,
    sendTime: new Date().toISOString(),
    dataVersion: "http://purl.imsglobal.org/ctx/caliper/v1p1",
    data: payload
  };

  // Create envelope with data payload
  var envelope = sensor.createEnvelope(opts);

  // Delegate transmission responsibilities to client
  sensor.sendToClient(client, envelope);
  // console.log("Assessment Event = " + util.inspect(event));
}