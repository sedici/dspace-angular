import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EPeopleRegistryComponent } from './epeople-registry/epeople-registry.component';
import { GroupFormComponent } from './group-registry/group-form/group-form.component';
import { GroupsRegistryComponent } from './group-registry/groups-registry.component';
import { GROUP_EDIT_PATH } from './admin-access-control-routing-paths';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'epeople', component: EPeopleRegistryComponent, data: { title: 'admin.access-control.epeople.title' } },
      { path: GROUP_EDIT_PATH, component: GroupsRegistryComponent, data: { title: 'admin.access-control.groups.title' } },
      {
        path: `${GROUP_EDIT_PATH}/:groupId`,
        component: GroupFormComponent,
        data: {title: 'admin.access-control.groups.title.singleGroup'}
      },
      {
        path: `${GROUP_EDIT_PATH}/newGroup`,
        component: GroupFormComponent,
        data: {title: 'admin.access-control.groups.title.addGroup'}
      },
    ])
  ]
})
/**
 * Routing module for the AccessControl section of the admin sidebar
 */
export class AdminAccessControlRoutingModule {

}
