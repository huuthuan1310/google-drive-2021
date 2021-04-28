import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var gapi: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'googleDrive2021';
  DISCOVERY_DOCS = [
    'https://discovery.googleapis.com/$discovery/rest',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  ];
  SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.photos.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ].join(' ');
  @ViewChild('authorize_button') authorizeButton: ElementRef;
  @ViewChild('signout_button') signoutButton: ElementRef;
  @ViewChild('content') content: ElementRef;

  constructor() {}

  ngOnInit() {}

  initGoogleOAuth() {
    gapi.load('client', async () => {
      gapi.client
        .init({
          apiKey: environment.firebase.apiKey,
          clientId: environment.GAPI_CLIENT_ID,
          discoveryDocs: this.DISCOVERY_DOCS,
          scope: this.SCOPES,
        })
        .then(() => {
          gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
            this.updateSigninStatus(isSignedIn);
          });

          // Handle the initial sign-in state.
          this.updateSigninStatus(
            gapi.auth2.getAuthInstance().isSignedIn.get()
          );
        });
    });
  }

  updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      this.authorizeButton.nativeElement.style.display = 'none';
      this.signoutButton.nativeElement.style.display = 'block';
      this.listFiles();
    } else {
      this.authorizeButton.nativeElement.style.display = 'block';
      this.signoutButton.nativeElement.style.display = 'none';
    }
  }

  handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
  }

  handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
  }

  appendPre(message) {
    var textContent = document.createTextNode(message + '\n');
    this.content.nativeElement.appendChild(textContent);
  }

  listFiles() {
    const self = this;
    gapi.client.drive.files
      .list({
        pageSize: 10,
        q: '"1HcZSqcgjtS6qDxYLWFx5DkaWm64tW0pl" in parents',
        fields: 'nextPageToken, files(mimeType,parents,driveId,iconLink,id,name,ownedByMe,owners,shared,sharingUser)',
      })
      .then((response) => {
        self.appendPre('Files:');
        var files = response.result.files;
        if (files && files.length > 0) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            self.appendPre(file.name + ' (' + file.id + ')');
          }
        } else {
          self.appendPre('No files found.');
        }
      });
  }
}
