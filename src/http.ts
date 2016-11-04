import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

// import 'rxjs/add/operator/distinctUntilChanged';

export interface Headers {
  [key: string]: any;
}

export interface Response {
  Headers: string;
  Body: string;
  Text: string;
  Type: string;
  Status: number;
  StatusText: string;
  Json: Object;
}

export class Http {
  private _xmlRequest: XMLHttpRequest;

  constructor() {
    this._xmlRequest = new XMLHttpRequest();
  }

  get(url: string, headers?: Headers): Observable<Response> {
    return this._request('GET', url, undefined, headers);
  }

  post(url: string, data?: any, headers?: Headers): Observable<Response> {
    return this._request('POST', url, data, headers);
  }

  put(url: string, data?: any, headers?: Headers): Observable<Response> {
    return this._request('PUT', url, data, headers);
  }

  delete(url: string, data?: any, headers?: Headers): Observable<Response> {
    return this._request('DELETE', url, data, headers);
  }

  private _request(method: string, url: string, data?: any, headers?: Headers): Observable<Response> {
    return Observable.create((observer: Observer<any>) => {
      this._xmlRequest.open(method, url, true);

      if (headers) {
        Object.keys(headers).forEach((key: string) => {
          this._xmlRequest.setRequestHeader(key, headers[key]);
        });
      }

      this._xmlRequest.onload = (ev) => {
        let json = {};

        try {
          json = JSON.parse(this._xmlRequest.response);
        } catch (error) {}

        let response: Response = ({
          Headers: Http.parseHeader(this._xmlRequest.getAllResponseHeaders()),
          Body: this._xmlRequest.response,
          Text: this._xmlRequest.responseText,
          Type: this._xmlRequest.responseType,
          Status: this._xmlRequest.status,
          StatusText: this._xmlRequest.statusText,
          Json: json
        } as Response);

        if (this._xmlRequest.status < 200 || this._xmlRequest.status >= 300) {
          observer.error(response);
        } else {
          observer.next(response);
        }

        observer.complete();
      };

      if (method === 'POST' || method === 'PUT') {
        this._xmlRequest.send(data);
      } else {
        this._xmlRequest.send();
      }
    });
  }

  static parseHeader(headerStr: string){
     let headers = {};

     if (!headerStr) {
       return headers;
     }

     let headerPairs = headerStr.split('\u000d\u000a');

     for (var i = 0; i < headerPairs.length; i++) {
       let headerPair = headerPairs[i];
       // Can't use split() here because it does the wrong thing
       // if the header value has the string ": " in it.
       let index = headerPair.indexOf('\u003a\u0020');
       if (index > 0) {
         let key = headerPair.substring(0, index);
         let val = headerPair.substring(index + 2);

         headers[key] = val;
       }
     }

     return headers;
   }
}
