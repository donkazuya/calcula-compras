import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import {
    TuiAppearance,
    TuiButton,
    TuiError,
    TuiTextfield,
    TuiTitle,
    TuiScrollable,
    TuiScrollbar,
    TuiAlertService,
    TuiDialogService,
    TuiDialogContext
} from '@taiga-ui/core';
import {TUI_CONFIRM, type TuiConfirmData} from '@taiga-ui/kit';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import { TuiTable } from '@taiga-ui/addon-table';
import {type PolymorpheusContent} from '@taiga-ui/polymorpheus';

	import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { NgxMaskDirective } from 'ngx-mask';



@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
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
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    TuiScrollable,
    TuiScrollbar,
    TuiTable,
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

  protected readonly columns = ['valor', 'produto', 'quantidade', 'actions'];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      valor: ['', [Validators.required]],
      quantidade: ['', [Validators.required]],
      produto: ['']
    })

    const savedList = sessionStorage.getItem('lista-compras');
    if (savedList) {
      this.list.set(JSON.parse(savedList));
    }
  }

  addItemList() {
    if(this.form.valid) {
      this.list.update(current => [...current, this.form.value]);
      sessionStorage.setItem('lista-compras', JSON.stringify(this.list()));
      this.form.reset();
      this.cdr.markForCheck();
    }
  }

  removerItem(index: number) {
    this.list.update(current => current.filter((_, i) => i !== index));
    sessionStorage.setItem('lista-compras', JSON.stringify(this.list()));
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
}
