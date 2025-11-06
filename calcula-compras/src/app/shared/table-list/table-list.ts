import { DecimalPipe, NgClass, NgForOf } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { TuiButton, TuiScrollable, TuiScrollbar, TuiTextfield } from '@taiga-ui/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-table-list',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    DecimalPipe,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    TuiScrollable,
    TuiScrollbar,
    TuiTable,
    TuiButton,
    TuiTextfield,
    NgxMaskDirective,
  ],
  templateUrl: './table-list.html',
  styleUrl: './table-list.scss',
})
export class TableList implements OnInit {
  protected readonly columns = ['quantidade', 'valorUnitario', 'valor', 'produto', 'actions'];
  formList: FormGroup;
  private carregandoInicial = true;

  @Input() list = signal<any[]>([]);
  @Input() set novoItem(item: any) {
    if (!this.carregandoInicial && item) {
      this.adicionarItem(item);
    }
  }
  @Output() itemAdicionado = new EventEmitter<number>();
  @Output() limpar = new EventEmitter<{type: string, index: number}>();
  @Output() remover = new EventEmitter<number>();


  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
     this.formList = this.fb.group({
      itens: this.fb.array([]),
    });

  }

  ngOnInit(): void {
      const savedList = sessionStorage.getItem('lista-compras');
      if (savedList) {
        JSON.parse(savedList).forEach((item: any) => this.adicionarItem(item));
      }
      this.carregandoInicial = false;
  }

  get itens(): FormArray {
    return this.formList.get('itens') as FormArray;
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

  adicionarItem(item: any) {
    this.itens.push(
      this.fb.group({
        quantidade: [item.quantidade, [Validators.required]],
        valor: [item.valor, [Validators.required]],
        produto: [item.produto],
      })
    );

    this.itemAdicionado.emit(this.itens.length - 1);
    this.cdr.markForCheck();
  }

  handleLimpar(type: string, index: number): void {
    this.itens.removeAt(index);
    this.cdr.markForCheck();
    this.limpar.emit({type, index});
  }

}
