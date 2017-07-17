import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from "app/login-page/login-page.component";
import { CreateDetailsPageComponent } from "app/create-details-page/create-details-page.component";
import { EditDetailsPageComponent } from "app/edit-details-page/edit-details-page.component";
import { HomePageComponent } from "app/home-page/home-page.component";
import { AdminPageComponent } from "app/admin-page/admin-page.component";
import { ProfilePageComponent } from "app/profile-page/profile-page.component";
import { DeleteProfilePageComponent } from "app/delete-profile-page/delete-profile-page.component";
import { EditSkillsPageComponent } from "app/edit-skills-page/edit-skills-page.component";
import { AdvancedEditDetailsPageComponent } from "app/advanced-edit-details-page/advanced-edit-details-page.component";
import { EditWorkshopsPageComponent } from 'app/edit-workshops-page/edit-workshops-page.component';
import { AdminProfilePageComponent } from 'app/admin-profile-page/admin-profile-page.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'login-page',
    component: LoginPageComponent
  },
  {
    path: 'create-details-page',
    component: CreateDetailsPageComponent
  },
  {
    path: 'edit-details-page',
    component: EditDetailsPageComponent
  },
  {
    path: 'admin-page',
    component: AdminPageComponent
  },
  {
    path: 'home-page',
    component: HomePageComponent
  },
  {
    path: 'profile-page',
    component: ProfilePageComponent
  },
  {
    path: 'delete-profile-page',
    component: DeleteProfilePageComponent
  },
  {
    path: 'edit-skills-page',
    component: EditSkillsPageComponent
  },
  {
    path: 'advanced-edit-details-page',
    component: AdvancedEditDetailsPageComponent
  },
  {
    path: 'edit-workshops-page',
    component: EditWorkshopsPageComponent
  },
  {
    path: 'admin-profile-page',
    component: AdminProfilePageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})

export class AppRoutingModule { }
