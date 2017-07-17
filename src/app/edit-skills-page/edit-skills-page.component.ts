import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import Utils from './../common/common.helper';
import Alert from './../common/common.alerts';
import * as firebase from 'firebase/app';
import { PipeTransform, Pipe } from '@angular/core';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-edit-skills-page',
  templateUrl: './edit-skills-page.component.html',
  styleUrls: ['./edit-skills-page.component.css']
})
export class EditSkillsPageComponent implements OnInit {
  alerts: any;
  skills: any;
  availableSkills: any = {};
  skillItems: any[];
  inputResults: any = {};
  selectedPercentage: number = null;
  @ViewChild('customskill') customskill: ElementRef;
  @ViewChild('account') account: ElementRef;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};

  constructor(private router: Router, private db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    // Load the available alerts
    this.alerts = {saveSuccess: new Alert('Success:', 'Successfully updated skills.', 'success'),
                   errInvalidPercentage: new Alert('Error:', 'The skill level must be an integer betwen 0 and 100.', 'danger'),
                   errNoSkill: new Alert('Error:', 'You must enter a skill.', 'danger'),
                   errNoPercentage: new Alert('Error:', 'You must enter a percentage skill rating.', 'danger'),
                   errSkillExists: new Alert('Error:', 'You already have that skill.', 'danger'),
                   errNoSelectedSkill: new Alert('Error:', 'Please select a skill.', 'danger')};

    for (var alertid in this.alerts) this.alerts[alertid].id = alertid;
  }

  loadUserSkills() {
    //Loads Account Holders Name
    this.account.nativeElement.innerHTML = `<h1>List of Skills for <b>${this.afAuth.auth.currentUser.displayName ? this.afAuth.auth.currentUser.displayName : this.afAuth.auth.currentUser.email}:</b></h1>`;
    // Load the list of available skills
    this.db.list('/SageData/Skills', { preserveSnapshot: true })
    .subscribe(snapshots => {
      // Load the skills into an associative array (dictionary)
      this.skills = {};
      snapshots.forEach(snapshot => this.skills[snapshot.key] = snapshot.val());

      // Load the list of available user skills
      this.db.list('/SageData/UserSkill', { preserveSnapshot: true })
      .subscribe(snapshots => {
        var asTemp = JSON.parse(JSON.stringify(this.skills));
        // Initialse the skill item storage
        this.skillItems = [];
        // Loop through all the user skills
        snapshots.forEach(snapshot => {
          // If the current user skill belongs to the current logged in user add HTML with the skill and the percentage rating
          if (snapshot.val().userid == this.afAuth.auth.currentUser.uid) {
            this.inputResults[snapshot.key] = snapshot.val().percentage;
            delete asTemp[snapshot.val().skillid];
            // Add a new skillitem to the list storing the current user skill key and skill id (as a reference to the text input box)
            this.skillItems.push({ id:snapshot.key, skillid:snapshot.val().skillid, percentage:snapshot.val().percentage });
          }
        });
        this.availableSkills = JSON.parse(JSON.stringify(asTemp));
        var g = 0;
        this.dropdownList = [];
        for (var skillid in this.availableSkills) this.dropdownList[g++] = {"id": skillid, "itemName": this.availableSkills[skillid]};
        this.dropdownList[g] = {"id": 'other', "itemName": 'New Skill'};
      });
    });
  }

  hideAlerts() {
    for (var alertid in this.alerts) this.alerts[alertid].hide();
  }

  saveChanges() {
    this.hideAlerts();
    var allowUpdate = true;
    var values = { };
    // Loop through all the skill items
    for (var userskillid in this.inputResults) {
      values[userskillid] = parseInt(this.inputResults[userskillid]);
      if (!Utils.checkPercentage(String(this.inputResults[userskillid]))) { allowUpdate = false; break; }
    }

    if (allowUpdate) {
      for (var id in values) this.db.object(`/SageData/UserSkill/${id}`).update({ percentage:values[id] });
      this.alerts.saveSuccess.show()
    } else this.alerts.errInvalidPercentage.show();
  }

  removeSkill(id: string) {
    this.hideAlerts();
    this.db.object(`/SageData/UserSkill/${id}`).remove();
  }

  toProfilePage() {
    this.hideAlerts();
    this.router.navigate(['profile-page']);
  }

  addSkill() {
    this.hideAlerts();
    if (this.selectedItems.length == 0) this.alerts.errNoSelectedSkill.show();
    else if (this.selectedItems[0].id == 'other') {
      var customSkill = this.customskill.nativeElement.value;
      if (!Utils.isEmptyOrWhiteSpace(customSkill)) {
        if (this.selectedPercentage) {
          if (Utils.checkPercentage(String(this.selectedPercentage))) {
            this.db.list('/SageData/Skills', { preserveSnapshot: true }).take(1)
            .subscribe(snapshots => {
              var skillId = '';
              var newSkillRequired = true;
              snapshots.forEach(snapshot => {
                if (customSkill.toLowerCase() == snapshot.val().toLowerCase()) {
                  newSkillRequired = false;
                  skillId = snapshot.key;
                }
              });

              if (newSkillRequired) skillId = this.db.list(`/SageData/Skills`).push(customSkill).key;

              this.db.list('/SageData/UserSkill', { preserveSnapshot: true }).take(1)
              .subscribe(snapshots => {
                var alreadHasSkill = false;
                snapshots.forEach(snapshot => {
                  if (snapshot.val().skillid == skillId) alreadHasSkill = true;
                });

                if (!alreadHasSkill) {
                  this.db.list('/SageData/UserSkill').push({ skillid:skillId,
                                                             userid:this.afAuth.auth.currentUser.uid,
                                                             percentage:this.selectedPercentage });
                  this.selectedPercentage = null;
                  this.alerts.saveSuccess.show();
                }
                else this.alerts.errSkillExists.show();
              });
            });
          } else this.alerts.errInvalidPercentage.show();
        } else this.alerts.errNoPercentage.show();
      } else this.alerts.errNoSkill.show();
    } else {
      if (this.selectedPercentage) {
        if (Utils.checkPercentage(String(this.selectedPercentage))) {
          this.db.list('/SageData/UserSkill')
            .push({ skillid:this.selectedItems[0].id,
                    userid:this.afAuth.auth.currentUser.uid,
                    percentage:this.selectedPercentage });
          this.selectedItems = [];
          this.selectedPercentage = null;
          this.alerts.saveSuccess.show();
        } else this.alerts.errInvalidPercentage.show();
      } else this.alerts.errNoPercentage.show();
    }
  }

  ngOnInit() {
    // subscribes to the authstate to be called whenever the authstate changes
    this.afAuth.authState.subscribe(auth => {
      // checks to see if user is authorised - if not, the user is navigated to the login page
      if (!auth) this.router.navigate(['login-page']);
      // If the user is authenticated load the user skills table
      else this.loadUserSkills();
    });

    this.dropdownSettings = {
                              singleSelection: true,
                              text:"Select Skill",
                              enableCheckAll: false,
                              enableSearchFilter: true,
                              classes:"myclass custom-class"
                            };
  }

  onItemSelect(item:any) {
    this.updateSelection();
  }

  OnItemDeSelect(item:any) {
    this.updateSelection();
  }

  updateSelection() {
    if (this.selectedItems[0].id == 'other') this.customskill.nativeElement.style.display = 'block';
    else this.customskill.nativeElement.style.display = 'none';
  }
}

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) keys.push(key);
    return keys;
  }
}
