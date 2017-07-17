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
  selector: 'app-edit-details-page',
  templateUrl: './edit-details-page.component.html',
  styleUrls: ['./edit-details-page.component.css']
})
export class EditDetailsPageComponent implements OnInit {
  alerts: any;
  locations: any;
  user: any;
  selectedLocationId: string = '';
  canDeleteProfile: boolean;
  @ViewChild('account') account: ElementRef;
  @ViewChild('name') name: ElementRef;
  @ViewChild('email') email: ElementRef;
  @ViewChild('phone') phone: ElementRef;
  @ViewChild('address') address: ElementRef;
  @ViewChild('address2') address2: ElementRef;
  @ViewChild('address3') address3: ElementRef;
  @ViewChild('postcode') postcode: ElementRef;
  @ViewChild('birthday') birthday: ElementRef;
  //@ViewChild('sagelocation') sagelocation: ElementRef;
  @ViewChild('dpconfirm') dpconfirm: ElementRef;

  constructor(private router: Router, private db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    this.alerts = [new Alert("Success!", "Successfully saved changes."),
                   new Alert("Could Not Save!","Please fill out, and save, all fields marked by a * before leaving the page.", "danger"),
                   new Alert("Could Not Save!","Please enter and save a valid email (exampleemail@domain.something).", "warning"),
                   new Alert("Could Not Save!","Please enter and save a valid Phone Number (11 digits).", "warning")];

    // Load all alerts
    for (var i = 0; i < this.alerts.length; i++) this.alerts[i].id = i;
  }

  deleteProfileConfirmation () {
      var status = this.dpconfirm.nativeElement.style.display;
      if (status == 'block') this.dpconfirm.nativeElement.style.display = 'none';
      else this.dpconfirm.nativeElement.style.display = 'block';
      this.canDeleteProfile = true;
  }

  deleteProfile () {
    if (this.canDeleteProfile) {
      this.dpconfirm.nativeElement.style.display = 'none';
      this.db.list('/SageData/Users', { preserveSnapshot: true })
        .subscribe(snapshots => {
          var key = null;
          snapshots.forEach(snapshot => {
            var currentUser = snapshot.val();
            if (currentUser.id == this.afAuth.auth.currentUser.uid) key = snapshot.key;
          });
          if (key) this.db.object(`/SageData/Users/${key}`).remove();
        });
      this.afAuth.auth.currentUser.delete();
      this.canDeleteProfile = false;
      this.router.navigate(['login-page']);
    }
  }

  cancelDeleteProfile () {
    this.dpconfirm.nativeElement.style.display = 'none';
    this.canDeleteProfile = false;
  }

  saveDetails() {
    for (var i = 0; i < this.alerts.length; i++) this.alerts[i].hide();

    var name = this.name.nativeElement.value;
    var email = this.email.nativeElement.value;
    var phone = this.phone.nativeElement.value;
    var address = this.address.nativeElement.value;
    var address2 = this.address2.nativeElement.value;
    var address3 = this.address3.nativeElement.value;
    var postcode = this.postcode.nativeElement.value;
    var birthday = this.birthday.nativeElement.value;

    if (this.dataValidation(name, email, phone, address, address2,
        address3, postcode, birthday, this.selectedLocationId)) {
      this.db.list('/SageData/Users')
      .update(this.user.key,
        { name:name, email:email, phone:phone, address:address,
          address2:address2, address3:address3, postcode:postcode,
          birthday:birthday, sagelocation:this.selectedLocationId });
      this.alerts[0].show();
    }
  }

  dataValidation(name, email, phone, address, address2, address3, postcode, birthday, sagelocationid) {
    var valid = true;
    var validitylist = [ name, phone, address, postcode, birthday ];
    for (var i = 0; i < validitylist.length; i++) if (validitylist[i] == "") { valid = false; this.alerts[1].show(); }
    //checking the user has enetered a valid phone number
    if (phone != "") { if (!Utils.checkNumber(phone)) { valid = false; this.alerts[3].show(); } }
    //checking sagelocation dropdown is not the default
    if (sagelocationid == "0") { valid = false; this.alerts[1].show(); }
    //checking the user has entered a valid email
    if (email != "") if (!Utils.checkEmail(email)) { valid = false; this.alerts[2].show(); }
    return valid;
  }

  loadUserInfo() {
    // Fetch the avaialbe sage locations
    this.db.list('/SageData/Locations', { preserveSnapshot: true })
    .subscribe(snapshots=> {
      // Add the sage locations to an object (dictionary)
      this.locations = { };
      snapshots.forEach(snapshot => {
        this.locations[snapshot.key] = snapshot.val();
      });

      // Fetch the users
      this.db.list('/SageData/Users', { preserveSnapshot: true })
      .subscribe(snapshots=> {
        this.user = { };
        snapshots.forEach(snapshot => {
          var currentUser = snapshot.val();
          if (currentUser.id == this.afAuth.auth.currentUser.uid) {
            this.user = currentUser;
            this.user.key = snapshot.key;
          }
        });
        this.account.nativeElement.innerHTML = `<h1>Account details of <b>${this.user.name ? this.user.name : this.user.email}</b></h1>`;
        this.name.nativeElement.value = this.user.name ? this.user.name : '';
        this.email.nativeElement.value = this.user.email ? this.user.email : '';
        this.phone.nativeElement.value = this.user.phone ? this.user.phone : '';
        this.address.nativeElement.value = this.user.address ? this.user.address : '';
        this.address2.nativeElement.value = this.user.address2 ? this.user.address2 : '';
        this.address3.nativeElement.value = this.user.address3 ? this.user.address3 : '';
        this.postcode.nativeElement.value = this.user.postcode ? this.user.postcode : '';
        this.birthday.nativeElement.value = this.user.birthday ? this.user.birthday : '';
        this.selectedLocationId = this.user.sagelocation;
      });
    });
  }

  toProfilePage() {
    for (var i = 0; i < this.alerts.length; i++) this.alerts[i].hide();
    this.router.navigate(['profile-page']);
  }

  ngOnInit() {
    // subscribes to the authstate to be called whenever the authstate changes
    this.afAuth.authState.subscribe(auth => {
      // checks to see if user is authorised - if not, the user is navigated to the login page
      if(!auth) this.router.navigate(['login-page']);
      else this.loadUserInfo();
      this.canDeleteProfile = false;
    });
  }
}
