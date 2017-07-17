import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  alerts: any;
  isNewUser: boolean;
  @ViewChild('accountInUse') accountInUse: ElementRef;

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth, private router: Router) {
    // subscribes to the authstate to be called whenever the authstate changes
    afAuth.authState.subscribe(auth => {
      // if authorised, navigate to the home page
      if (auth) router.navigate(['home-page']);
    });

    this.alerts = [new Alert('Login Error!', 'There was an error validating the account. This may mean you already have an account with a different provider.', 'danger'),
                   new Alert('Login Error!', 'Invalid email or password.', 'danger')];

  }

  removeAlerts() {
    for (var i = 0; i < this.alerts.length; i++) this.alerts[i].hide();
  }

  // method to login with google
  loginWithGoogle() {
    this.removeAlerts();
    // calls the authoriser and creates a pop up window
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .catch(error => {
        this.alerts[0].show();
      });
    // see method below named 'fillInfo'
    this.fillInfo();
  }

// method to login with facebook
  loginWithFaceBook() {
    this.removeAlerts();
    // calls the authoriser and creates a pop up window
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
      .catch(error => {
        this.alerts[0].show();
      });
    // see method below named 'fillInfo'
    this.fillInfo();
  }

// method to login with twitter
  loginWithTwitter() {
    this.removeAlerts();
    // calls the authoriser and creates a pop up window
    this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider())
      .catch(error => {
        this.alerts[0].show();
      });
    // see method below named 'fillInfo'
    this.fillInfo();
  }

// method to login with an email & password
  loginWithEmailAndPassword(email, password){
    this.removeAlerts();
    // calls the authoriser and signs in
    this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .catch(error => this.alerts[1].show());
  }

// method to call the user to fill in extra information required by the app
  fillInfo() {
    // check to see if authorised
    this.afAuth.authState.subscribe(auth => {
      if (auth) {
        var uid = this.afAuth.auth.currentUser.uid;
        var email = this.afAuth.auth.currentUser.email;
        var name = this.afAuth.auth.currentUser.displayName;
        var phoneNumber = this.afAuth.auth.currentUser.phoneNumber;

        var userDbAccess = this.db.list('/SageData/Users');
        this.isNewUser = true;
        this.db.list('/SageData/Users', { preserveSnapshot: true })
        .subscribe(snapshots=>{
          var i = 0;
          snapshots.forEach(snapshot => {
            var currentUser = snapshot.val();
            if (currentUser.id == this.afAuth.auth.currentUser.uid) this.isNewUser = false;
          });

          if (this.isNewUser) {
            userDbAccess.push({id:uid, email:email != null ? email : '',
                               name:name != null ? name : '',
                               phone:phoneNumber != null ? phoneNumber : '',
                               address:'', sagelocation:0,
                               isadmin:false, birthday:''});
            this.router.navigate(['edit-details-page']);
          }
        });
      }
    });
  }

// method to navigate to the create details page, uses routing module named 'app-routing.module.ts'
  toCreateDetails() {
    this.router.navigate(['create-details-page']);
  }

  ngOnInit() { }
}
