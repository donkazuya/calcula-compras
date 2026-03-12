import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TableList } from './table-list'; // ajuste para seu nome real
import { provideNgxMask } from 'ngx-mask';

describe('TableList (template)', () => {
  let component: TableList;
  let fixture: ComponentFixture<TableList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TableList],
      providers: [
        provideNgxMask() // registra o provider necessário
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(TableList);
    component = fixture.componentInstance;

    // inicializa os @Input()
    component.formList = new FormBuilder().group({
      itens: new FormArray([])
    });

    const fb = new FormBuilder();
    const itensArr = component.formList.get('itens') as FormArray;
    itensArr.push(fb.group({
      quantidade: [1],
      valor: [5],
      produto: ['Leite']
    }));

    component.list.set([{ quantidade: 1, valor: 5, produto: 'Leite' }]);

    fixture.detectChanges();
  });


  it('deve renderizar cabeçalhos da tabela', () => {
    const headers = fixture.debugElement.queryAll(By.css('th'));
    const headerTexts = headers.map(h => h.nativeElement.textContent.trim());
    expect(headerTexts).toContain('Quantidade');
    expect(headerTexts).toContain('Valor unitário');
    expect(headerTexts).toContain('Valor');
    expect(headerTexts).toContain('Produto');
    expect(headerTexts).toContain('Ações');
  });

  it('deve chamar salvarEdicao ao perder foco', () => {
    spyOn(component, 'salvarEdicao');

    // adiciona item ao FormArray
    const itens = component.formList.get('itens') as FormArray;
    itens.push(new FormBuilder().group({
      quantidade: [1],
      valor: [5],
      produto: ['Leite']
    }));

    fixture.detectChanges();

    // busca o input corretamente
    const input = fixture.debugElement.query(By.css('input[formControlName="quantidade"]'));
    expect(input).toBeTruthy();

    // dispara evento blur com objeto simulando target
    input.triggerEventHandler('blur', { target: input.nativeElement });

    expect(component.salvarEdicao).toHaveBeenCalledWith(0);

  });


  it('deve chamar handleLimpar ao clicar no botão de ações', () => {
    spyOn(component, 'handleLimpar');

    // adiciona item ao FormArray
    const itens = component.formList.get('itens') as FormArray;
    itens.push(new FormBuilder().group({
      quantidade: [1],
      valor: [5],
      produto: ['Leite']
    }));

    fixture.detectChanges();

    // usa seletor completo
    const btn = fixture.debugElement.query(By.css('button[tuiButton][appearance="negative"]'));
    expect(btn).toBeTruthy(); // garante que encontrou

    btn.triggerEventHandler('click', null);

    expect(component.handleLimpar).toHaveBeenCalledWith('item', 0);
  });


});

describe('TableList (methods)', () => {
  let component: TableList;
  let fixture: ComponentFixture<TableList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TableList],
      providers: [provideNgxMask()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableList);
    component = fixture.componentInstance;
    localStorage.clear();

    fixture.detectChanges();
  });

  it('ngOnInit deve carregar itens do localStorage', () => {
    const mockItem = { quantidade: 2, valor: 10, produto: 'Arroz' };
    localStorage.setItem('lista-compras', JSON.stringify([mockItem]));

    component.ngOnInit();

    expect(component.itens.length).toBe(1);
    expect(component.itens.at(0).value).toEqual(mockItem);
  });

  it('adicionarItem deve inserir item no FormArray e emitir evento', () => {
    spyOn(component.itemAdicionado, 'emit');

    const item = { quantidade: 1, valor: 5, produto: 'Leite' };
    component.adicionarItem(item);

    expect(component.itens.length).toBe(1);
    expect(component.itens.at(0).value).toEqual(item);
    expect(component.itemAdicionado.emit).toHaveBeenCalledWith(0);
  });

  it('salvarEdicao deve atualizar lista e salvar no localStorage', () => {
    const item = { quantidade: 1, valor: 5, produto: 'Leite' };
    component.adicionarItem(item);

    component.itens.at(0).patchValue({ quantidade: 3 });
    component.salvarEdicao(0);

    expect(component.list()[0].quantidade).toBe(3);

    const saved = JSON.parse(localStorage.getItem('lista-compras')!);
    expect(saved[0].quantidade).toBe(3);
  });


  it('handleLimpar deve remover item e emitir evento', () => {
    const item = { quantidade: 1, valor: 5, produto: 'Leite' };
    component.adicionarItem(item);

    // garante que o item foi adicionado
    expect(component.itens.length).toBe(1);

    spyOn(component.limpar, 'emit');

    component.handleLimpar('item', 0);

    // agora deve estar vazio
    expect(component.itens.length).toBe(0);
    expect(component.limpar.emit).toHaveBeenCalledWith({ type: 'item', index: 0 });
  });



  it('novoItem deve adicionar item apenas após carregamento inicial', () => {
    spyOn(component, 'adicionarItem');

    // durante carregamento inicial não deve adicionar
    component['carregandoInicial'] = true;
    component.novoItem = { quantidade: 1, valor: 5, produto: 'Leite' };
    expect(component.adicionarItem).not.toHaveBeenCalled();

    // após carregamento inicial deve adicionar
    component['carregandoInicial'] = false;
    component.novoItem = { quantidade: 1, valor: 5, produto: 'Leite' };
    expect(component.adicionarItem).toHaveBeenCalled();
  });
});

