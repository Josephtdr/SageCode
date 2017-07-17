import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  alerts: any;
  newSkillName: string = '';
  userProfiles: any[];
  userProfile: any;
  selectedSkills: any = {};
  skills: any = {};
  skillsEditor: any = {};
  @ViewChild('adminload') adminload: ElementRef;
  @ViewChild('adminpage') adminpage: ElementRef;
  dropdownList = []; locationdropdownList = [];
  selectedItems = []; locationselectedItems = [];
  dropdownSettings = {}; locationdropdownSettings = {};
  userCheck: any[];
  outputArray: any[];
  enableDelete: boolean = false;

  // Initialize the class
  constructor(public data: DataService, public db: AngularFireDatabase, public afAuth: AngularFireAuth, private router: Router) {
    this.alerts = {skillSaveSuccess: new Alert('Success:', 'Successfully udpated skills.'),
                   errNoSkillName: new Alert('Error:', 'A skill name is required.', 'danger'),
                   errSkillAlreadyExists: new Alert('Error:', 'Skill already exists.', 'danger')};

    this.selectedSkills['-KoaSFKLashfgafjsl'] = true;
    this.outputArray = [];

    db.list('/SageData/Skills', {preserveSnapshot: true})
    .subscribe(snapshots => {
      snapshots.forEach(snapshot => this.selectedSkills[snapshot.key] = false)
    })

    // Fetch the avaialbe sage locations
    db.list('/SageData/Locations', { preserveSnapshot: true })
    .subscribe(snapshots=> {
      // Add the sage location to an array
      var locations = {};
      snapshots.forEach(snapshot => {
        locations[snapshot.key] = snapshot.val();
      });

      // Fetch the available user profiles
      db.list('/SageData/Users', { preserveSnapshot: true })
      .subscribe(snapshots=> {
        this.userProfiles = [];
        var i = 0;
        snapshots.forEach(snapshot => {
          this.userProfiles[i] = snapshot.val();
          this.userProfiles[i].sagelocation = locations[this.userProfiles[i++].sagelocation];
          //this.userProfile[i]['skills_and_percentages'] = {};
        });
      });
    });

    for (var alertid in this.alerts) this.alerts[alertid].id = alertid;
  }

  hideAlerts() {
    for (var alertid in this.alerts) this.alerts[alertid].hide();
  }

  deleteProfile (userid: string) {
    this.db.list('/SageData/Users', { preserveSnapshot: true })
      .subscribe(snapshots =>
        snapshots.forEach(snapshot => {
          if (snapshot.val().id == userid) if (this.enableDelete) this.db.object(`/SageData/Users/${snapshot.key}`).remove();
        })
      );
    this.db.list("/SageData/UserSkill", {preserveSnapshot:true}).subscribe(snapshots =>
      snapshots.forEach(snapshot => {
        if (snapshot.val().userid == userid) if (this.enableDelete) this.db.object(`/SageData/UserSkill/${snapshot.key}`).remove();
      })
    );
    //if (this.enableDelete) this.afAuth.auth..delete();
  }

  deleteSkill(skillid: string) {
    this.hideAlerts();
    this.db.list('/SageData/UserSkill', { preserveSnapshot: true }).take(1)
    .subscribe(snapshots=> {
      snapshots.forEach(snapshot => {
        if (skillid == snapshot.val().skillid) this.db.object(`SageData/UserSkill/${snapshot.key}`).remove();
      });
      this.db.object(`SageData/Skills/${skillid}`).remove();
    });
  }

  addSkill() {
    this.hideAlerts();
    if (Utils.checkExists(this.newSkillName))
      this.db.list('/SageData/Skills', { preserveSnapshot: true }).take(1)
      .subscribe(snapshots=> {
        var skillAlreadyExists = false;
        snapshots.forEach(snapshot => {
          if (this.newSkillName.toLowerCase() == snapshot.val().toLowerCase()) skillAlreadyExists = true;
        });
        if (skillAlreadyExists) this.alerts.errSkillAlreadyExists.show();
        else {
          this.db.list('/SageData/Skills').push(this.newSkillName);
          this.newSkillName = '';
          this.alerts.skillSaveSuccess.show();
        }
      });
    else this.alerts.errNoSkillName.show();
  }

  toggleAdmin(isadmin: boolean, userid: string) {
    this.db.list('/SageData/Users', { preserveSnapshot: true }).take(1)
    .subscribe(snapshots=> {
      snapshots.forEach(snapshot => {
        var currentUser = snapshot.val();
        if (currentUser.id == userid) this.db.list('SageData/Users').update(snapshot.key, { isadmin:!isadmin });
      });
    });
  }

  showUserProfile(userid: string) {
    this.data.uid = userid;
    this.router.navigate(['admin-profile-page']);
  }

  loadUser() {
    this.db.list('/SageData/Users', { preserveSnapshot: true })
    .subscribe(snapshots=> {
      this.userProfile = { isadmin:false };

      snapshots.forEach(snapshot => {
        if (snapshot.val().id == this.afAuth.auth.currentUser.uid) this.userProfile = snapshot.val();
      });

      if(!this.userProfile.isadmin) {
        this.router.navigate(['home-page']);
        this.adminload.nativeElement.style.display = 'inline'
        this.adminpage.nativeElement.style.display = 'none'
      } else {
        this.adminload.nativeElement.style.display = 'none'
        this.adminpage.nativeElement.style.display = 'inline'
      }
    });
  }

  loadSkills() {
    this.db.list('/SageData/Skills', {preserveSnapshot:true})
    .subscribe(snapshots => {
      this.skills = {};
      snapshots.forEach(snapshot => this.skills[snapshot.key] = snapshot.val());
      this.skillsEditor = JSON.parse(JSON.stringify(this.skills));
      this.db.list('/SageData/UserSkill', {preserveSnapshot:true})
      .subscribe(snapshots => {
        for (var profileid in this.userProfiles) {
          this.userProfiles[profileid]['skills'] = [];
          snapshots.forEach(snapshot => {
            if (this.userProfiles[profileid].id == snapshot.val().userid)
              this.userProfiles[profileid]['skills'].push(`${this.skills[snapshot.val().skillid]} (${snapshot.val().percentage}%)`);
          });
          if (this.userProfiles[profileid]['skills'].length == 0) this.userProfiles[profileid]['skills'] = null;
        }
      });
    });
  }

  onItemSelect(item:any) {
    this.outputToTable();
  }

  outputToTable() {
      if(this.selectedItems.length == 0 && this.locationselectedItems.length == 0){
        console.log("No items selected");
        this.db.list('/SageData/Locations', { preserveSnapshot: true })
        .subscribe(snapshots=>{
          // Add the sage location to an array
          var locations = { };
          snapshots.forEach(snapshot => {
            locations[snapshot.key] = snapshot.val();
          });

          // Fetch the available user profiles
          this.db.list('/SageData/Users', { preserveSnapshot: true })
          .subscribe(snapshots=> {
            this.userProfiles = [];
            var i = 0;
            snapshots.forEach(snapshot => {
              this.userProfiles[i] = snapshot.val();
              this.userProfiles[i].sagelocation = locations[this.userProfiles[i++].sagelocation];
            });
          });
        });
        this.loadSkills();
      } else {
        console.log("Items selected");
        var array = [];
        var skillIdArray = [];
        var skillsForUser = [];
        var counter = 0;
        var counterii = 0;

        this.db.list('/SageData/Users', {preserveSnapshot: true}).subscribe(Usnaps =>{
          this.db.list('/SageData/UserSkill', {preserveSnapshot: true}).subscribe(USsnaps =>{
            Usnaps.forEach(Usnap => {
              skillsForUser = [];
              USsnaps.forEach(USsnap => {
                if(Usnap.val().id == USsnap.val().userid){
                  skillsForUser.push(USsnap.val().skillid);
                };
              });
              skillIdArray.push({userid: Usnap.val().id,
                                 skillids: skillsForUser});
            });
          });
        });
        this.db.list('/SageData/Users', {preserveSnapshot: true}).subscribe(Usnaps =>{
          this.db.list('/SageData/Locations', {preserveSnapshot: true}).subscribe(Lsnaps =>{
            Usnaps.forEach(Usnap => {
              Lsnaps.forEach(Lsnap => {
                if(Usnap.val().sagelocation == Lsnap.key){
                  skillIdArray.forEach(record => {
                    if(Usnap.val().id == record.userid){
                      array.push({userid: Usnap.val().id,
                                  locationid: Lsnap.key,
                                  skills: record.skillids});
                    }
                  })
                }
              })
            })
          })
        })
        array.forEach(record => {
          if(this.locationselectedItems.length > 0 && this.selectedItems.length == 0) {
            this.locationselectedItems.forEach(locationSelect => {
              if(record.locationid == locationSelect.id)
                this.outputArray.push({userid: record.userid});
            })
          }
          if(this.selectedItems.length > 0 && this.locationselectedItems.length == 0) {
            counter = 0;
            this.selectedItems.forEach(skillSelect => {
              record.skills.forEach(skillid => {
                if(skillid != skillSelect.id) {
                  ++counter;
                }
              })
              if(counter == (record.skills.length - this.selectedItems.length))
                this.outputArray.push({userid: record.userid});
            })
          }
          if(this.selectedItems.length > 0 && this.locationselectedItems.length > 0) {
            this.locationselectedItems.forEach(locationSelect => {
              if(record.locationid == locationSelect.id) {
                counterii = 0;
                this.selectedItems.forEach(skillSelect => {
                  record.skills.forEach(skillid => {
                    if (skillid != skillSelect.id) counterii++;
                  })
                  if(counterii == (record.skills.length - this.selectedItems.length))
                    this.outputArray.push({userid: record.userid});
                })
              }
            })
          }
      });
      this.printToTable();
      this.loadSkills();
    };
  }

  printToTable() {
    this.userProfiles = [];
    var locations = {};
    var x = 0;
    this.db.list('/SageData/Locations', { preserveSnapshot: true })
    .subscribe(snapshots=>{
      snapshots.forEach(snapshot => {
      locations[snapshot.key] = snapshot.val();
      });
      this.db.list('/SageData/Users', { preserveSnapshot: true })
        .subscribe(snapshots=>{
        snapshots.forEach(snapshot => {
          this.outputArray.forEach(output =>{
            if(output.userid == snapshot.val().id){
                this.userProfiles[x] = snapshot.val();
                this.userProfiles[x].sagelocation = locations[this.userProfiles[x++].sagelocation];
            }
          })
        });
      });
    })
    this.outputArray =[];
  }

  locationonItemSelect(item:any) {
    this.outputToTable();
  }

  ngOnInit() {
    this.outputToTable();

    // subscribes to the authstate to be called whenever the authstate changes
    this.afAuth.authState.subscribe(auth => {
      // checks to see if user is authorised - if not, the user is navigated to the login page
      if (!auth) this.router.navigate(['login-page']);
      else this.loadUser();
    });

    var y = 0;
    this.db.list('/SageData/Skills', {preserveSnapshot: true})
    .subscribe(snaps => {
      snaps.forEach(snap => {
        this.dropdownList[y++] = {"id": snap.key, "itemName":snap.val()};
      })
    })

    var arr = 0;
    this.db.list('/SageData/Locations', {preserveSnapshot: true})
    .subscribe(snaps =>{
      snaps.forEach(snap => {
        if(snap.key != "0") this.locationdropdownList[arr++] = {"id": snap.key, "itemName":snap.val()}
      })
    })

    this.dropdownSettings = { singleSelection: false,
                              text:"Select Skills. Default: All",
                              enableCheckAll: false,
                              enableSearchFilter: true,
                              classes:"myclass custom-class" };

    this.locationdropdownSettings = { singleSelection: false,
                                      text:"Select Locations. Default: All",
                                      enableCheckAll: false,
                                      enableSearchFilter: true,
                                      classes:"myclass custom-class" };
  }
}
