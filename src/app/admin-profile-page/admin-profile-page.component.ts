import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-admin-profile-page',
  templateUrl: './admin-profile-page.component.html',
  styleUrls: ['./admin-profile-page.component.css']
})
export class AdminProfilePageComponent implements OnInit {
  alerts: any;

  @Input()
  uid: string = 'none';

  user: any = {};
  skills: any[] = [];
  workshops: any[] = [];
  locations: any = {};

  constructor(public data: DataService, public db: AngularFireDatabase, public afAuth: AngularFireAuth, public router: Router) { }

  back() {
    this.router.navigate(['admin-page']);
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
          if (snapshot.val().id == this.uid) this.user = snapshot.val();
        });
      });
    });
  }

  ngOnInit() {
    this.uid = this.data.uid;

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
          if(UserSkillsnapshot.val().skillid==SkillSnapshot.key && UserSkillsnapshot.val().userid == this.uid)
            this.skills[i++] = {"skill": SkillSnapshot.val(), "percentage":UserSkillsnapshot.val().percentage};
          });
        });
      });
    });
    var j=0;
    this.db.list('/SageData/UserWorkshop', {preserveSnapshot: true}).subscribe(UWsnaps => {
      UWsnaps.forEach(UWsnap => {
        if(UWsnap.val().userid == this.uid) {
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
