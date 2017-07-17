import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';
import { AngularFireModule } from 'angularfire2'
import { DataService } from '../data.service';
import { Pipe } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  alerts: any;
  userObservables: FirebaseListObservable<any[]>;
  user: Observable<firebase.User>;
  users: FirebaseListObservable<any[]>;
  writePosts: FirebaseListObservable<any[]>;
  readPosts: any[];
  ttlVal: string = '';
  msgVal: string = '';
  @ViewChild('adminpagebutton') adminpagebutton: ElementRef;
  @ViewChild('titlebox') titlebox: ElementRef;
  @ViewChild('messagebox') messagebox: ElementRef;

  constructor(public data: DataService, public db: AngularFireDatabase, public afAuth: AngularFireAuth, private router: Router) {
      this.user = afAuth.authState;
      this.userObservables = db.list('/SageData/Users');
      this.users = this.db.list('/SageData/Users', { preserveSnapshot: true })
      this.user = this.afAuth.authState;
      this.readPosts = [];
      var j = 0;
      db.list('/SageData/AdminPosts', {preserveSnapshot: true}).subscribe(snaps => {
        for (let i = snaps.length - 1; i > -1; i--) {
            this.readPosts[j++] = {title: snaps[i].val().title, message: snaps[i].val().message};
        }
      })
      this.writePosts = db.list('/SageData/AdminPosts', {preserveSnapshot: true});
  }

  sendMessage() {
    this.writePosts.push({ title:this.ttlVal, message:this.msgVal});
    this.readPosts = [];
    var j = 0;
    this.db.list('/SageData/AdminPosts', {preserveSnapshot: true}).subscribe(snaps => {
      for (let i = snaps.length - 1; i > -1; i--) {
          this.readPosts[j++] = {title: snaps[i].val().title, message: snaps[i].val().message};
      }
    })
    this.ttlVal = '';
    this.msgVal = '';
  }

// method to navigate to the admin page, uses routing module named 'app-routing.module.ts'
  toAdminPage(){
    this.router.navigate(['admin-page'])
  }

  ngOnInit() {
    // checks to see if user is authorised - if not, the user is navigated to the login page
    this.afAuth.authState.subscribe(auth => {
      // method to navigate to the login page, uses routing module named 'app-routing.module.ts'
      if (!auth) this.router.navigate(['login-page']);
    });

    this.titlebox.nativeElement.style.display = 'none';
    this.messagebox.nativeElement.style.display = 'none';

    this.db.list('/SageData/Users', {preserveSnapshot: true}).subscribe(snaps => {
      snaps.forEach(snap=>{
        if(this.afAuth.auth.currentUser.uid == snap.val().id && snap.val().isadmin == true){
          this.titlebox.nativeElement.style.display = 'inline';
          this.messagebox.nativeElement.style.display = 'inline';
        }
      })
    })
  }
}
