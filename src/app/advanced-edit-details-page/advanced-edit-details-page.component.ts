import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-advanced-edit-details-page',
  templateUrl: './advanced-edit-details-page.component.html',
  styleUrls: ['./advanced-edit-details-page.component.css']
})
export class AdvancedEditDetailsPageComponent implements OnInit {
  alerts: any;

  constructor() { }

  ngOnInit() {
    //document.getElementById("passwordform").style.display="none";
  }
}
