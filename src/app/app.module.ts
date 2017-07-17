import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { firebaseConfig } from './../environments/firebase.config';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { EditDetailsPageComponent } from './edit-details-page/edit-details-page.component';
import { CreateDetailsPageComponent } from './create-details-page/create-details-page.component';
import { EditWorkshopsPageComponent } from './edit-workshops-page/edit-workshops-page.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { DeleteProfilePageComponent } from './delete-profile-page/delete-profile-page.component';
import { EditSkillsPageComponent, KeysPipe } from './edit-skills-page/edit-skills-page.component';
import { AdvancedEditDetailsPageComponent } from './advanced-edit-details-page/advanced-edit-details-page.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { AdminProfilePageComponent } from './admin-profile-page/admin-profile-page.component';
import { DataService } from './data.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent,
    EditDetailsPageComponent,
    CreateDetailsPageComponent,
    AdminPageComponent,
    ProfilePageComponent,
    DeleteProfilePageComponent,
    EditSkillsPageComponent,
    AdvancedEditDetailsPageComponent,
    KeysPipe,
    EditWorkshopsPageComponent,
    AdminProfilePageComponent
  ],
  imports: [
    BrowserModule,
    AngularMultiSelectModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    FormsModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
