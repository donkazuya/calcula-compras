import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErroForm {
  getErrorMessage$(control: AbstractControl | null, label: string): Observable<string | null> {
    if (!control || !control.errors || (!control.touched && !control.dirty)) {
      return of(null);
    }

    const errors = control.errors;

    if (errors['required']) {
      return of(`${label} é obrigatório.`);
    }

    if (errors['min']) {
      return of(`${label} mínimo é ${errors['min'].min}.`);
    }

    return of(null);
  }

}
