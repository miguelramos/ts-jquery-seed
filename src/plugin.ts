import { Http } from './http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';

interface User {
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  html_url: string;
  id: number;
  login: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  score: number;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
}

interface UserResponse {
  incomplete_results: boolean;
  total_count: number;
  items: Array<User>;
}

const HubComplete = (($) => {

  const NAME                = 'autohub'
  const JQUERY_NO_CONFLICT  = $.fn[NAME]
  const GH_TOKEN            = '238aaf8e01c412a10e9391f29c2502d70740294d';

  interface OptionType {
    url?: string;
    dropdownWidth?: string;
    onSelect?: Function;
  }

  class HubComplete {
    static defaultOptions: OptionType = {
      url: null,
      dropdownWidth: '100%',
      onSelect: () => { }
    }

    public element: JQuery;
    public options: OptionType;

    private input: JQuery;
    private http: Http;
    private dropdown: JQuery;

    constructor(element: JQuery, options: OptionType = {}) {
      let mergedOptions: OptionType = $.extend(HubComplete.defaultOptions, options);

      this.options = mergedOptions;
      this.element = element;
      this.http = new Http();

      this.OnCreate();
    }

    OnCreate() {
      this.element.css('position', 'relative');
      this.input = this.element.find('input');

      if (!this.input) {
        alert('Add a input text in the container element!');
        return;
      }

      Observable.fromEvent(this.input, 'input').subscribe((event: Event) => {
        let search = (<HTMLInputElement>event.target).value;

        if (search.length >= 3) {
          let params = '?' + $.param({
            q: (<HTMLInputElement>event.target).value,
            access_token: GH_TOKEN
          });

          this.search(this.options.url + params)
        }
      });

      this.createDropDown();
    }

    createDropDown() {
      let el = document.createElement('div');
      let top = this.input.outerHeight(true);

      this.dropdown = $(el).css({
        display: 'none',
        position: 'absolute',
        left: 0,
        top: top,
        width: this.options.dropdownWidth,
        background: '#edebef',
        maxHeight: '250px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        borderLeft: '5px solid #dad9d9',
        borderRight: '5px solid #dad9d9',
        borderBottom: '5px solid #dad9d9'
      }).addClass('drop');

      this.element.append(el);
    }

    search(url: string) {
      this.http.get(url).subscribe((rs) => {
        let users = <UserResponse>rs.Json;
        $(this.dropdown).empty();

        users.items.forEach(user => {
          $(this.dropdown).append(`
            <div class="dropdown">
              <div class="side">
                <img src="${user.avatar_url}" class="avatar">
              </div>
              <a class="side">${user.login}</a>
            </div>
          `);
        });

        this.toggle();
        this.navigate();
        this.select();
      });
    }

    toggle(show: boolean = true) {
      this.dropdown.css('display', show ? 'block' : 'none');
    }

    navigate() {
      let index = -1;

      let nav = (diff: number) => {
        index += diff;
        let collection = $('.dropdown');

        if (index >= collection.length) {
          index = 0;
        }

        if (index < 0) {
          index = collection.length - 1;
        }

        collection.removeClass('dropdown-display').eq(index).addClass('dropdown-display');
      }

      this.input.keyup(function (e) {
        if (e.keyCode == 40) {
          nav(1);
          return false;
        }
        if (e.keyCode == 38) {
          nav(-1);
          return false;
        }
      });

    }

    select() {
      (<any>$(this.dropdown)).on('click', 'a', (ev: MouseEvent) => {
        ev.preventDefault();

        this.input.val((<HTMLAnchorElement>ev.target).textContent);
        this.toggle(false);
      });
    }

    // static
    static _jQueryInterface(config: OptionType) {
      return $(this).each(function () {
        return new HubComplete($(this), config);
      });
    }
  }

  $.fn[NAME]             = HubComplete._jQueryInterface
  $.fn[NAME].Constructor = HubComplete
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return HubComplete._jQueryInterface
  }

  return HubComplete

})(jQuery)

export default HubComplete;
