import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  alerts: any;
  user: any = {};
  skills: any[] = [];
  workshops: any[] = [];
  locations: any = {};

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, public router: Router) {

  }

  toEditDetails() {
    this.router.navigate(['edit-details-page'])
  }

  toEditSkillsPage() {
    this.router.navigate(['edit-skills-page'])
  }

  toEditWorkshopsPage(){
    this.router.navigate(['edit-workshops-page'])
  }

  loadUserInfo() {
    // Fetch the avaialbe sage locations
    this.db.list('/SageData/Locations', { preserveSnapshot: true })
    .subscribe(snapshots=> {
      // Add the sage locations to an object (dictionary)
      this.locations = { };
      snapshots.forEach(snapshot => this.locations[snapshot.key] = snapshot.val());

      // Fetch the users
      this.db.list('/SageData/Users', { preserveSnapshot: true })
      .subscribe(snapshots=> {
        this.user = { };
        snapshots.forEach(snapshot => {
          if (snapshot.val().id == this.afAuth.auth.currentUser.uid) this.user = snapshot.val();
        });
      });
    });
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(auth => {
      if (!auth) this.router.navigate(['login-page']);
      else this.loadUserInfo();
    });
    var i = 0;
    this.db.list("/SageData/Skills", { preserveSnapshot:true })
    .subscribe(SkillSnapshots => {
      this.db.list("/SageData/UserSkill", { preserveSnapshot:true })
      .subscribe(UserSkillsnapshots => {
        UserSkillsnapshots.forEach(UserSkillsnapshot => {
          SkillSnapshots.forEach(SkillSnapshot=> {
          if(UserSkillsnapshot.val().skillid==SkillSnapshot.key && UserSkillsnapshot.val().userid == this.afAuth.auth.currentUser.uid)
            this.skills[i++] = {"skill": SkillSnapshot.val(), "percentage":UserSkillsnapshot.val().percentage};
          });
        });
      });
    });
    var j=0;
    this.db.list('/SageData/UserWorkshop', {preserveSnapshot: true}).subscribe(UWsnaps => {
      UWsnaps.forEach(UWsnap => {
        if(UWsnap.val().userid == this.afAuth.auth.currentUser.uid) {
          this.db.list('/SageData/Workshops', {preserveSnapshot: true}).subscribe(Wsnaps => {
            Wsnaps.forEach(Wsnap => {
              if(Wsnap.key == UWsnap.val().workshopid) {
                this.workshops[j++] = {"title": Wsnap.val(), "description":UWsnap.val().description};
                console.log(this.workshops[0].title)
              }
            });
          });
        }
      });
    });
  }
}
