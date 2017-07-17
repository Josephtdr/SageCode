import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  @ViewChild('logoutbutton') logoutbutton: ElementRef;
  @ViewChild('viewprofilebutton') viewprofilebutton: ElementRef;
  @ViewChild('viewhomebutton') viewhomebutton: ElementRef;
  @ViewChild('adminpagebutton') adminpagebutton: ElementRef;

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, private router: Router) { }

  logout(){
    this.afAuth.auth.signOut();
    this.router.navigate(['login-page'])
  }

  toProfile() {
    this.router.navigate(['profile-page'])
  }

  toAdminPage(){
    this.router.navigate(['admin-page'])
  }

  toHomePage() {
    this.router.navigate(['home-page']);
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(auth => {
      if(!auth){
        this.logoutbutton.nativeElement.style.display = 'none'
        this.viewprofilebutton.nativeElement.style.display = 'none'
        this.viewhomebutton.nativeElement.style.display = 'none'
        this.adminpagebutton.nativeElement.style.display = 'none'
      } else {
        this.logoutbutton.nativeElement.style.display = 'inline'
        this.viewprofilebutton.nativeElement.style.display = 'inline'
        this.viewhomebutton.nativeElement.style.display = 'inline'
        this.adminpagebutton.nativeElement.style.display = 'inline'

        this.db.list('/SageData/Users', { preserveSnapshot: true })
          .subscribe(snapshots=>{
            var user = { isadmin:false };

            snapshots.forEach(snapshot => {
              var currentUser = snapshot.val();
              if (currentUser.id == this.afAuth.auth.currentUser.uid) user = currentUser;
            });

            this.adminpagebutton.nativeElement.style.display = user.isadmin ? 'inline' : 'none';
          });
        }
      });
    }
  }
