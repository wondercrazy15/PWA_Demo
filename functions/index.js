var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({ origin: true });
var webpush = require('web-push');



var serviceAccount = require("./demopwa-5d6bc-firebase-adminsdk-r58g7-21e4d51d61.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://demopwa-5d6bc.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function (request, response) {
  debugger;
  cors(request, response, function () {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    })
      .then(function () {
        webpush.setVapidDetails('mailto:vishal.natrixsoftware@gmail.com', 'BGWSgmSlfQionEFZWK0STBCCx1nyF7Z8_81CDRhKrfvh1KHn3HQfZf0UjUDXM19NAsQ4QvJTNuo3WVVrA14LSaU', 'T_l6KHZEuQt9Lt-yURIpc1tvwK2Y7w2HlnOHhiwcuEg');
        return admin.database().ref('subscriptions').once('value');
      })
      .then(function (subscriptions) {
        subscriptions.forEach(function (sub) {
          var pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh
            }
          };

          webpush.sendNotification(pushConfig, JSON.stringify({
            title: 'New Post',
            content: 'New Post added!',
            openUrl: '/help'
          }))
            .catch(function (err) {
              console.log(err);
            })
        });
        response.status(201).json({ message: 'Data stored', id: request.body.id });
      })
      .catch(function (err) {
        response.status(500).json({ error: err });
      });
  });
});
