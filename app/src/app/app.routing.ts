import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent }  from './modules/home/home.component';
import { ScheduleComponent } from './modules/schedule/schedule.component';
import { SearchComponent } from './modules/search/search.component';
import { AboutComponent } from './modules/about/about.component'; 
import { PersonComponent } from './modules/person/person.component'; 
import { PersonsComponent } from './modules/persons/persons.component'; 
import { PublicationsComponent } from './modules/publications/publications.component'; 
import { PublicationComponent } from './modules/publication/publication.component';
import { AuthorsComponent } from './modules/authors/authors.component';
import { RolesComponent } from "./modules/roles/roles.component";
import { OrganizationsComponent } from "./modules/organizations/organizations.component";
import {PublicationsByCategoryComponent} from "./modules/publications-by-category/publications-by-category.component";
import {CategoriesForPublicationsComponent} from "./modules/caterogies-for-publications/categories-for-publications.component";
import {PersonByRoleComponent} from "./modules/person-by-role/person-by-role.component";
import {OrganizationComponent} from "./modules/organization/organization.component";


const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'schedule',
    component: ScheduleComponent
  },
  {
    path: 'search/:id',
    component: SearchComponent
  },
  {
    path: 'publications-by-category/:id',
    component: PublicationsByCategoryComponent
  },
    {
        path: 'person-by-role/:id/:ref',
        component: PersonByRoleComponent
    },
  {
    path: 'categories-for-publications',
    component: CategoriesForPublicationsComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'person/:name/:id',
    component: PersonComponent
  },
  {
    path: 'organization/:name/:id',
    component: OrganizationComponent
  },
  {
    path: 'publication/:name/:id',
    component: PublicationComponent
  },
  {
    path: 'persons',
    component: PersonsComponent
  },
  {
    path: 'publications',
    component: PublicationsComponent
  },
  {
    path: 'authors',
    component: AuthorsComponent
  },
  {
    path: 'roles',
    component: RolesComponent
  },
  {
    path: 'organizations',
    component: OrganizationsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);