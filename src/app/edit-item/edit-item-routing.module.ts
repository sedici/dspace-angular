import { ThemedSubmissionEditComponent } from './../submission/edit/themed-submission-edit.component';
import {
  mapToCanActivate,
  Route,
} from '@angular/router';
import { authenticatedGuard } from '../core/auth/authenticated.guard';
import { SubmissionEditComponent } from '../submission/edit/submission-edit.component';

export const ROUTES: Route[] = [
  {
    path: ':id/form',
    runGuardsAndResolvers: 'always',
    canActivate: [authenticatedGuard],
    component: ThemedSubmissionEditComponent,
    data: { title: 'submission.edit.title' }
  },
]
