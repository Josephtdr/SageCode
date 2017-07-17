import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-delete-profile-page',
  templateUrl: './delete-profile-page.component.html',
  styleUrls: ['./delete-profile-page.component.css']
})
export class DeleteProfilePageComponent implements OnInit {
  alerts: any;
  user: Observable<firebase.User>;

  constructor(public afAuth: AngularFireAuth, private router: Router) {
    // subscribes to the authstate to be called whenever the authstate changes
    afAuth.authState.subscribe(auth => {
      this.user = afAuth.authState;
      // checks to see if user is authorised - if not, the user is navigated to the login page
      if (!auth) router.navigate(['login-page']);
    })
  }

  ngOnInit() { }
}
