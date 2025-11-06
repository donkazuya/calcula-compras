import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import {
    TuiAppearance,
    TuiButton,
    TuiError,
    TuiTextfield,
    TuiTitle,
} from '@taiga-ui/core';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import { NgxMaskDirective } from 'ngx-mask';
import { TableList } from '../../shared/table-list/table-list';
import { ErroForm } from '../../services/erro-form';
import { LimparService } from '../../services/limpar';


@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiForm,
    TuiHeader,
    TuiTextfield,
    TuiTitle,
    DecimalPipe,
    TableList
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  form: FormGroup;
  list = signal<any[]>([]);
  valorTotal = computed(() =>
    this.list().reduce((acc, item) => acc + Number(item.valor) * Number(item.quantidade), 0)
  );

  itemParaAdicionar: any = null;
  constructor(
    private fb: FormBuilder,
    private erroService: ErroForm,
    private limparService: LimparService
  ) {
    this.form = this.fb.group({
      valor: ['', [Validators.required]],
      quantidade: ['', [Validators.required]],
      produto: ['']
    });

    const savedList = sessionStorage.getItem('lista-compras');
    if (savedList) {
      this.list.set(JSON.parse(savedList));
    }
  }

  addItemList() {
    if(this.form.valid) {
      const item = structuredClone(this.form.value)

      this.list.update(current => [...current, item]);
      sessionStorage.setItem('lista-compras', JSON.stringify(this.list()));
      this.itemParaAdicionar = item;
      this.form.reset();
    }
  }

  onItemAdicionado(index: number) {
    this.itemParaAdicionar = null;
  }

  removerItem(index: number) {
    this.list.update(current => current.filter((_, i) => i !== index));
    sessionStorage.setItem('lista-compras', JSON.stringify(this.list()));
  }

  removerLista() {
    this.list.set([]);
    sessionStorage.removeItem('lista-compras');
  }

  getErrorMessage$(controlName: string): Observable<string | null> {
    const control = this.form.get(controlName);
    const label = controlName.charAt(0).toUpperCase() + controlName.slice(1);
    return this.erroService.getErrorMessage$(control, label);
  }

  limpar(type: any): void {
    this.limparService
      .confirmarLimpeza(type, (i) => this.removerItem(i), () => this.removerLista())
      .subscribe();
  }

  protected trackByIndex(index: number): number {
      return index;
  }
}
