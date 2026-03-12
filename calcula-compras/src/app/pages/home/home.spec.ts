import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Home } from './home';
import { ErroForm } from '../../services/erro-form';
import { LimparService } from '../../services/limpar';
import { of } from 'rxjs';
import { provideNgxMask } from 'ngx-mask';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');


describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        ReactiveFormsModule,
        Home,
      ],
      providers: [
        provideNgxMask(),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve renderizar os campos do formulário', () => {
    const valorInput = fixture.debugElement.query(By.css('input[formControlName="valor"]'));
    const quantidadeInput = fixture.debugElement.query(By.css('input[formControlName="quantidade"]'));
    const produtoInput = fixture.debugElement.query(By.css('input[formControlName="produto"]'));

    expect(valorInput).toBeTruthy();
    expect(quantidadeInput).toBeTruthy();
    expect(produtoInput).toBeTruthy();
  });

  it('deve chamar addItemList ao submeter o formulário', () => {
    spyOn(component, 'addItemList');
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);
    expect(component.addItemList).toHaveBeenCalled();
  });

  it('não deve mostrar botão "Limpar lista" quando lista está vazia', () => {
    component.list.set([]); // lista vazia
    fixture.detectChanges();
    const limparBtn = fixture.debugElement.query(By.css('button[tuiButton][appearance="accent"]'));
    expect(limparBtn?.nativeElement.textContent).not.toContain('Limpar lista');

  });

  it('deve mostrar botão "Limpar lista" quando lista tem itens', () => {
    component.form.setValue({
      produto: 'Leite',
      quantidade: 1,
      valor: 5
    });
    component.addItemList(); // garante que o botão apareça
    fixture.detectChanges();

    const limparBtn = fixture.debugElement.query(By.css('button[tuiButton][appearance="accent"]'));
    expect(limparBtn).toBeTruthy();
  });


  it('deve renderizar <app-table-list> quando lista tem itens', () => {
    component.list.set([{ produto: 'Leite', quantidade: 1, valor: 5 }]);
    fixture.detectChanges();

    const tableList = fixture.debugElement.query(By.css('app-table-list'));
    expect(tableList).toBeTruthy();
  });

});

describe('Home (métodos TS)', () => {
  let component: Home;
  let erroFormSpy: jasmine.SpyObj<ErroForm>;
  let limparServiceSpy: jasmine.SpyObj<LimparService>;

  beforeEach(() => {
    erroFormSpy = jasmine.createSpyObj('ErroForm', ['getErrorMessage$']);
    limparServiceSpy = jasmine.createSpyObj('LimparService', ['confirmarLimpeza']);
    sessionStorage.clear(); // garante que a lista comece vazia


    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, Home],
      providers: [
        { provide: ErroForm, useValue: erroFormSpy },
        { provide: LimparService, useValue: limparServiceSpy },
         provideNgxMask(),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    });

    const fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('addItemList deve adicionar item válido à lista, salvar no sessionStorage e resetar form', () => {
    sessionStorage.clear(); // evita itens pré-existentes
    component.form.setValue({ valor: 10, quantidade: 2, produto: 'Arroz' });

    component.addItemList();

    expect(component.list().length).toBe(1); // agora passa
    expect(component.list()[0]).toEqual({ valor: 10, quantidade: 2, produto: 'Arroz' });
    expect(component.itemParaAdicionar).toEqual({ valor: 10, quantidade: 2, produto: 'Arroz' });
    expect(component.form.value).toEqual({ valor: null, quantidade: null, produto: null });
    expect(JSON.parse(sessionStorage.getItem('lista-compras')!)).toEqual([{ valor: 10, quantidade: 2, produto: 'Arroz' }]);
  });

  it('não deve adicionar item se o formulário for inválido na chamada de addItemList', () => {
    sessionStorage.clear();
    component.form.setValue({ valor: null, quantidade: null, produto: null });
    
    component.addItemList();
    
    expect(component.list().length).toBe(0);
    expect(sessionStorage.getItem('lista-compras')).toBeNull();
  });

  it('deve calcular o valorTotal corretamente', () => {
    component.list.set([
      { produto: 'Leite', quantidade: 2, valor: 5.50 },
      { produto: 'Arroz', quantidade: 1, valor: 25.00 }
    ]);
    expect(component.valorTotal()).toBe(36.00);
  });

  it('deve carregar a lista do sessionStorage ao inicializar', () => {
    sessionStorage.setItem('lista-compras', JSON.stringify([{ produto: 'Café', quantidade: 1, valor: 10 }]));
    const newFixture = TestBed.createComponent(Home);
    const newComponent = newFixture.componentInstance;
    
    expect(newComponent.list().length).toBe(1);
    expect(newComponent.list()[0].produto).toBe('Café');
    sessionStorage.clear();
  });


  it('onItemAdicionado deve limpar itemParaAdicionar', () => {
    component.itemParaAdicionar = { produto: 'Teste' };
    component.onItemAdicionado(0);
    expect(component.itemParaAdicionar).toBeNull();
  });

  it('removerItem deve remover item pelo índice', () => {
    component.list.set([
      { produto: 'Leite', quantidade: 1, valor: 5 },
      { produto: 'Arroz', quantidade: 2, valor: 10 }
    ]);

    component.removerItem(0);
    expect(component.list().length).toBe(1);
    expect(component.list()[0].produto).toBe('Arroz');
  });

  it('removerLista deve limpar lista', () => {
    component.list.set([{ produto: 'Leite', quantidade: 1, valor: 5 }]);
    component.removerLista();
    expect(component.list().length).toBe(0);
  });

  it('getErrorMessage$ deve delegar para erroService', (done) => {
    const fake$ = of('Erro de teste');
    erroFormSpy.getErrorMessage$.and.returnValue(fake$);

    component.getErrorMessage$('valor').subscribe(result => {
      expect(result).toEqual('Erro de teste'); // comparação correta
      done(); // garante que o teste assíncrono finalize
    });
  });


  it('limpar deve chamar confirmarLimpeza do service', () => {
    limparServiceSpy.confirmarLimpeza.and.returnValue(of(void 0)); // Observable<void>

    component.limpar('teste');

    expect(limparServiceSpy.confirmarLimpeza).toHaveBeenCalled();
  });


  it('trackByIndex deve retornar o índice', () => {
    const result = component.trackByIndex(5);
    expect(result).toBe(5);
  });

});

