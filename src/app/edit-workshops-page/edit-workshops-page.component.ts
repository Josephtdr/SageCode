import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';
import { AngularFireModule } from 'angularfire2'

@Component({
  selector: 'app-edit-workshops-page',
  templateUrl: './edit-workshops-page.component.html',
  styleUrls: ['./edit-workshops-page.component.css']
})
export class EditWorkshopsPageComponent implements OnInit {
  alerts: any;

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, private router: Router) { }

  toProfilePage(){
    this.router.navigate(['profile-page']);
  }

  ngOnInit() {
    // subscribes to the authstate to be called whenever the authstate changes
    this.afAuth.authState.subscribe(auth => {
      // checks to see if user is authorised - if not, the user is navigated to the login page
      if (!auth) this.router.navigate(['login-page']);
    });
  }

}
