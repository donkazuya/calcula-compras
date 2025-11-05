import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DecimalPipe } from '@angular/common';
	import {
    TuiAppearance,
    TuiButton,
    TuiError,
    TuiIcon,
    TuiNotification,
    TuiTextfield,
    TuiTitle,
    TuiScrollable,
    TuiScrollbar
} from '@taiga-ui/core';
import {TuiFieldErrorPipe, TuiSegmented, TuiSwitch, TuiTooltip} from '@taiga-ui/kit';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import {type TuiComparator, TuiTable} from '@taiga-ui/addon-table';

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
    TuiFieldErrorPipe,
    TuiForm,
    TuiHeader,
    // TuiIcon,
    // TuiNotification,
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
export class Home implements OnInit {
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
  }

  ngOnInit() {
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
    this.cdr.markForCheck();
  }
}
