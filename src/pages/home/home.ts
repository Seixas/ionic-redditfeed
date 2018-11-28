import { Component } from '@angular/core';
import { NavController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  public feeds: Array<any>;
  private url: string = "https://www.reddit.com/new.json"; 
  private newerPosts: string = "https://www.reddit.com/new.json?before=";
  private olderPosts: string = "https://www.reddit.com/new.json?after=";
  
  public noFilter: Array<any>;
  public hasFilter: boolean = false;

  constructor(public navCtrl: NavController,
              private http: Http,
              public loadingCtrl: LoadingController,
              private iab: InAppBrowser,
              public actionSheetCtrl: ActionSheetController) {
   
    this.fetchContent();
    
  }
  
  options : InAppBrowserOptions = {
    location : 'yes',//Or 'no' 
    hidden : 'no', //Or  'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'yes',//Android only ,shows browser zoom controls 
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only 
    closebuttoncaption : 'Close', //iOS only
    disallowoverscroll : 'no', //iOS only 
    toolbar : 'yes', //iOS only 
    enableViewportScale : 'no', //iOS only 
    allowInlineMediaPlayback : 'no',//iOS only 
    presentationstyle : 'pagesheet',//iOS only 
    fullscreen : 'yes',//Windows only    
  };
  
  fetchContent ():void {
    
    let loading = this.loadingCtrl.create({
      content: 'Buscando conteúdo...'
    });
    
    loading.present();
    
    this.http.get(this.url).map(res => res.json())
      .subscribe(data => {
        
        for(let e of data.data.children){
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) { 
              e.data.thumbnail = 'https://www.redditstatic.com/icon.png';
              }
          }
          this.feeds = data.data.children;
          loading.dismiss();
      }); 
  }
  
  itemSelected (feed):void {
    let target = "_blank";
    this.iab.create(feed,target,this.options);
    //alert(feed.data.url);
  } 
  
  doInfinite(infiniteScroll) {
    
    let paramsUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1].data.name : "";
    
      this.http.get(this.olderPosts + paramsUrl).map(res => res.json())
        .subscribe(data => {
        
          this.feeds = this.feeds.concat(data.data.children);
          
          this.feeds.forEach((e, i, a) => {
            if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) {  
              e.data.thumbnail = 'https://www.redditstatic.com/icon.png';
            }
          })
          
          this.noFilter = this.feeds;
          this.hasFilter = false;
          
          infiniteScroll.complete();
        }); 
  }
  
  doRefresh(refresher) {

    let paramsUrl = this.feeds[0].data.name;

    this.http.get(this.newerPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {
      
        this.feeds = data.data.children.concat(this.feeds);
        
        this.feeds.forEach((e, i, a) => {
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) {  
            e.data.thumbnail = 'https://www.redditstatic.com/icon.png';
          }
        })

        this.noFilter = this.feeds;
        this.hasFilter = false;

        refresher.complete();
      });
  } 
  
   showFilters() :void {
     
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Filtros:',
      buttons: [
        {
          text: 'Música',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "music");
            this.hasFilter = true;
          }
        },
        {
          text: 'Filmes',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "movies");
            this.hasFilter = true;
          }
        },
        {
          text: 'Jogos',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "gaming");
            this.hasFilter = true;
          }
        },
        {
          text: 'Fotos',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "pics");
            this.hasFilter = true;
          }
        },                
        {
          text: 'Ask Reddit',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "askreddit");
            this.hasFilter = true;
          }
        },        
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.feeds = this.noFilter;
            this.hasFilter = false;
          }
        }
      ]
    });

    actionSheet.present();

  } 
}