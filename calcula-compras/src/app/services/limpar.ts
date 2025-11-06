import { Injectable } from '@angular/core';
import { TuiDialogService, TuiAlertService } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class LimparService {
  constructor(
    private dialogs: TuiDialogService,
    private alerts: TuiAlertService
  ) {}

  confirmarLimpeza(type: any, removerItem: (index: number) => void, removerLista: () => void): Observable<void> {
    const content = type === 'item' || type?.type
      ? 'Ao confirmar, o item será apagado permanentemente.'
      : 'Ao confirmar, todos os itens da lista serão apagados permanentemente.';

    const data = {
      content,
      yes: 'Deletar',
      no: 'Não, engano',
    };

    return this.dialogs.open<boolean>(TUI_CONFIRM, {
      label: 'Tem certeza?',
      size: 's',
      data,
    }).pipe(
      switchMap((response) => {
        if (response) {
          if (type === 'item' || type?.type) {
            removerItem(type?.index);
            return this.alerts.open('Item deletado com sucesso!');
          } else {
            removerLista();
            return this.alerts.open('Lista deletada com sucesso!');
          }
        } else {
          return this.alerts.open('Ação cancelada.');
        }
      })
    );
  }

}
