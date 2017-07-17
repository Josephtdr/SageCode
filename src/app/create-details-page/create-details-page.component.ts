import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import 'rxjs/add/operator/take';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-create-details-page',
  templateUrl: './create-details-page.component.html',
  styleUrls: ['./create-details-page.component.css']
})
export class CreateDetailsPageComponent implements OnInit {
  alerts: any;
  locations: any;
  userId: string;
  isNewUser: boolean;

  email: string = '';
  password: string = '';
  confirmpassword: string = '';
  name: string = '';
  mobile: string = '';
  address: string = '';
  address2: string = '';
  address3: string = '';
  postcode: string = '';
  birthday: string = '';
  sagelocation: string = '0';

  isValid: any = { all: false, email: null, password: null,
                   confirmpassword: null, name: null, mobile: null,
                   address: null, postcode: null,
                   birthday: null, sagelocation: null }

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, public router: Router) {
    this.afAuth.authState.subscribe(auth => {
      if (auth) this.router.navigate(['home-page']);
    });

    this.alerts = {regSuccess: new Alert("Success:","Account registered successfully."),
                   errAccountExists: new Alert("Error:","An account with this email already exists.", "danger"),
                   errNotComplete: new Alert("Error:","Please fill out all fields marked with a *.", "danger"),
                   errInvalidEmail: new Alert("Error:","Please enter a valid email (exampleemail@domain.something).", "warning"),
                   errInvalidPhone: new Alert("Error:","Please enter a valid Phone Number (11 digits).", "warning"),
                   errPasswordMissmatch: new Alert("Error:","Passwords Must Match.", "warning"),
                   errPasswordLength: new Alert("Error:","Password must be at least 6 characters long.", "warning"),
                   errGeneral: new Alert("Error:","Error creating account.", "warning")};

    for (var alertid in this.alerts) this.alerts[alertid].id = alertid;
  }

  backtoLoginPage() {
    // method to navigate to the login-page, uses routing module named 'app-routing.module.ts'
    this.router.navigate(['login-page']);
  }

  // Register a new account with the database
  register() {
    for (var alertid in this.alerts) this.alerts[alertid].hide();

    this.isValid['all'] = true;
    for (var currentItem in this.isValid) this.isValid['all'] = this.isValid['all'] && this.isValid[currentItem]

    //checking does not work with birthday and sage location
    if (this.isValid['all']) {
      this.db.list('/SageData/Users', { preserveSnapshot: true }).take(1)
      .subscribe(snapshots => {
        this.isNewUser = true;
        snapshots.forEach(snapshot => {
          if (snapshot.val().email == this.email) this.isNewUser = false;
        });

        if (this.isNewUser) {
          var iserror = false;
          // creates new user with custom email and password, required to sign back in
          firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
            .catch(error => { iserror = true; console.log(error); })
            .then(info => {
              if (!iserror) {
                // Push all the profile information to the database
                this.db.list('SageData/Users').push({ email:this.email, name:this.name, phone:this.mobile,
                                                      address:this.address, address2:this.address2,
                                                      address3:this.address3, birthday:this.birthday,
                                                      sagelocation:this.sagelocation, postcode:this.postcode,
                                                      id:info.uid });
                this.alerts.regSuccess.show();
              }
            });
        } else this.alerts.errAccountExists.show();
      })
    } else this.displayAlerts();
  }

  valueChanged(item, event) {
    for (var alertid in this.alerts) this.alerts[alertid].hide();

    switch (item) {
      case 'email':
        this.isValid.email = Utils.checkEmail(this.email);
        break;
      case 'password':
        this.isValid.password = Utils.checkPassword(this.password);
      case 'confirmpassword':
        this.isValid.confirmpassword = Utils.checkPasswords(this.password,
                                                               this.confirmpassword);
        break;
      case 'name':
        this.isValid.name = Utils.checkExists(this.name);
        break;
      case 'mobile':
        this.isValid.mobile = Utils.checkNumber(this.mobile);
        break;
      case 'address':
        this.isValid.address = Utils.checkExists(this.address);
        break;
      case 'postcode':
        this.isValid.postcode = Utils.checkExists(this.postcode);
        break;
      case 'birthday':
        this.isValid.birthday = Utils.checkExists(this.birthday);
        break;
      case 'sagelocation':
        this.isValid.sagelocation = this.sagelocation != '0';
        break;
      default:
        break;
    }
  }

  displayAlerts() {
    for (var alertid in this.alerts) this.alerts[alertid].hide();

    var checkExistsList = [ this.email, this.password, this.confirmpassword,
                            this.address, this.name, this.mobile, this.birthday ];
    for (var i = 0; i < checkExistsList.length; i++) if (!Utils.checkExists(checkExistsList[i])) { this.alerts.errNotComplete.show(); break };

    if (Utils.checkExists(this.email) && !Utils.checkEmail(this.email)) this.alerts.errInvalidEmail.show();
    if (Utils.checkExists(this.password)) this.alerts.errPasswordLength.show();
    if (Utils.checkExists(this.password) && Utils.checkExists(this.confirmpassword)
        && Utils.checkPasswords(this.password, this.confirmpassword)) this.alerts.errPasswordMissmatch.show();
    if (Utils.checkExists(this.mobile) && !Utils.checkNumber(this.mobile)) this.alerts.errInvalidPhone.show();
    if (this.sagelocation == '0') this.alerts.errNotComplete.show();
  }

  ngOnInit() {
    this.db.list('/SageData/Locations', { preserveSnapshot: true })
      .subscribe(snapshots=> {
        this.locations = [];
        snapshots.forEach(snapshot => this.locations[snapshot.key] = snapshot.val());
      });
  }
}
