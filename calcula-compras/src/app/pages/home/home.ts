import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DecimalPipe, NgClass, NgForOf } from '@angular/common';
import { Observable, of, switchMap } from 'rxjs';
import {
    TuiAppearance,
    TuiButton,
    TuiError,
    TuiTextfield,
    TuiTitle,
    TuiScrollable,
    TuiScrollbar,
    TuiAlertService,
} from '@taiga-ui/core';
import {TUI_CONFIRM, type TuiConfirmData} from '@taiga-ui/kit';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import { TuiTable } from '@taiga-ui/addon-table';

	import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { NgxMaskDirective } from 'ngx-mask';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';



@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    DecimalPipe,
    NgxMaskDirective,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiForm,
    TuiHeader,
    TuiTextfield,
    TuiTitle,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    TuiScrollable,
    TuiScrollbar,
    TuiTable,
    NgForOf,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  form: FormGroup;
  formList: FormGroup;
  list = signal<any[]>([]);
  valorTotal = computed(() =>
    this.list().reduce((acc, item) => acc + Number(item.valor) * Number(item.quantidade), 0)
  );

  protected readonly columns = ['quantidade', 'valorUnitario', 'valor', 'produto', 'actions'];
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      valor: ['', [Validators.required]],
      quantidade: ['', [Validators.required]],
      produto: ['']
    });

    this.formList = this.fb.group({
      itens: this.fb.array([]),
    });


    const savedList = sessionStorage.getItem('lista-compras');
    if (savedList) {
      this.list.set(JSON.parse(savedList));
      JSON.parse(savedList).forEach((item: any) => this.adicionarItem(item));
    }
  }

  addItemList() {
    if(this.form.valid) {
      const item = structuredClone(this.form.value)

      this.list.update(current => [...current, item]);
      sessionStorage.setItem('lista-compras', JSON.stringify(this.list()));
      
      this.adicionarItem(item);
      this.form.reset();
      this.cdr.markForCheck();

    }
  }

  adicionarItem(item: any) {
    this.itens.push(
      this.fb.group({
        quantidade: [item.quantidade, [Validators.required]],
        valor: [item.valor, [Validators.required]],
        produto: [item.produto],
      })
    );
    this.cdr.markForCheck();
  }

  removerItem(index: number) {
    this.list.update(current => current.filter((_, i) => i !== index));
    this.itens.removeAt(index);
    sessionStorage.setItem('lista-compras', JSON.stringify(this.list()));
    this.cdr.markForCheck();
  }

  removerLista() {
    this.itens.clear();
    this.list.set([]);
    sessionStorage.removeItem('lista-compras');
    this.cdr.markForCheck();
  }

  getErrorMessage$(controlName: string): Observable<string | null> {
    const control = this.form.get(controlName);
    if (!control || !control.errors || (!control.touched && !control.dirty)) {
      return of(null);
    }

    const errors = control.errors;
    const label = controlName.charAt(0).toUpperCase() + controlName.slice(1);

    if (errors['required']) {
      return of(`${label} é obrigatório.`);
    }

    if (errors['min']) {
      return of(`${label} mínimo é ${errors['min'].min}.`);
    }

    return of(null);
  }

   protected limpar(type: string, index?: any): void {
    const content = type == 'item' ? 
      'Ao confirmar, o item será apagado permanentemente.' : 
      'Ao confirmar, todos os itens da lista serão apagados permanentemente.';
    const data: TuiConfirmData = {
      content: content,
      yes: 'Deletar',
      no: 'Não, engano',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Tem certeza?',
        size: 's',
        data,
      })
      .pipe(
        switchMap((response) => {
          if (response) {
            if(type === 'item') {
              this.removerItem(index);
              return this.alerts.open('Item deletado com sucesso!');
            } else {
              this.removerLista();
              return this.alerts.open('Lista deletada com sucesso!');
            }
          } else {
            return this.alerts.open('Ação cancelada.');
          }
        })
      )
      .subscribe();
  }

  get itens(): FormArray {
    return this.formList.get('itens') as FormArray;
  }

  protected trackByIndex(index: number): number {
      return index;
  }

  salvarEdicao(index: number): void {
    const grupo = this.itens.at(index);
    const itemEditado = grupo.value;

    this.list.update(current => {
      const novaLista = [...current];
      novaLista[index] = itemEditado;
      return novaLista;
    });

    sessionStorage.setItem('lista-compras', JSON.stringify(this.list()));
    this.cdr.markForCheck();
  }
}
