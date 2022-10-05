import 'jquery';
import 'bootstrap/js/modal.js';
import i18next from 'i18next';
import {LuxBaseElement} from '../../LuxBaseElement';
import {html} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import { LuxOfflineServiceInstance } from './lux-offline.service';
import { OfflineStatus } from './lux-offline.model';

@customElement('lux-offline-reload')
export class LuxReloadAlert extends LuxBaseElement {

  @state()
  private status;

  private prevStatus;

  @query('.modal')
  private modal: HTMLElement;

  constructor() {
    super();
    this.prevStatus = LuxOfflineServiceInstance.status$.getValue();
    LuxOfflineServiceInstance.status$.subscribe((status)=> {
      if (status !== OfflineStatus.IN_PROGRESS && this.prevStatus != undefined
        && this.prevStatus !== OfflineStatus.UNINITIALIZED) {
        if (status != this.prevStatus) {
          $(this.modal).modal('show');
        }
      }
      this.prevStatus = status;
    });
    $(this.modal).modal('hide');
  }

  render() {
    return html`
      <div class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog offline-modal" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 class="modal-title">${i18next.t('App reload needed: Offline data updated successfully')}</h4>
            </div>
            <div class="modal-body">
              <div>
                <div class="offline-btn btn btn-primary" @click="${this.reloadApp}">
                  ${i18next.t('Restart app')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  reloadApp(){
    location.reload()
    $(this.modal).modal('hide');
  }

  createRenderRoot() {
    // no shadow dom
    return this;
  }
}
