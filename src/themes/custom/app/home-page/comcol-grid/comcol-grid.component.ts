import {
  NgClass,
  NgIf,
  NgTemplateOutlet,
  NgFor,
} from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface ExploracionDestacada {
  title: string;
  img: string;
  href: string;
  description?: string;
}
@Component({
  selector: 'comcol-grid',
  styleUrls: ['./comcol-grid.component.scss'],
  templateUrl: './comcol-grid.component.html',
  standalone: true,
  imports: [NgTemplateOutlet, NgIf, NgFor, RouterLink, TranslateModule, NgClass],
})
export class ComcolGridComponent {

  coleccionesDestacadas:Array<ExploracionDestacada> = [
    {
      title: "Red de Museos de la UNLP",
      img: "assets/custom/images/ComCol/redmuseos.png",
      href: "handle/10915/27268",
    } as ExploracionDestacada,
    {
      title: "Red de Universidades con Carreras en Informática (RedUNCI)",
      img: "assets/custom/images/ComCol/redunci.png",
      href: "handle/10915/18267",
    } as ExploracionDestacada,
    {
      title: "Radio Universidad Nacional de La Plata",
      img: "assets/custom/images/ComCol/Logo_Radio_Universidad.png",
      href: "handle/10915/25224",
    } as ExploracionDestacada,
    {
      title: "Dirección General de Educación a Distancia y Tecnologías (EAD)",
      img: "assets/custom/images/ComCol/ead.png",
      href: "handle/10915/21328",
    } as ExploracionDestacada,
    {
      title: "Sociedad Argentina de Informática (SADIO)",
      img: "assets/custom/images/ComCol/sadio.jpg",
      href: "handle/10915/38367",
    } as ExploracionDestacada,
    {
      title: "Presidencia",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "handle/10915/47",
    } as ExploracionDestacada,
  ];

  facultades:Array<ExploracionDestacada> = [
    {
      title: "Facultad de Arquitectura y Urbanismo",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/25",
      description: "Arquitectura y Urbanismo",
    } as ExploracionDestacada,
    {
      title: "Facultad de Artes",
      img: "assets/custom/images/ComCol/artes.png",
      href: "/handle/10915/38",
      description: "Artes",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Agrarias y Forestales",
      img: "assets/custom/images/ComCol/fca.png",
      href: "/handle/10915/10",
      description: "Ciencias Agrarias y Forestales",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Astronómicas y Geofísicas",
      img: "assets/custom/images/ComCol/astronomia.png",
      href: "/handle/10915/15",
      description: "Ciencias Astronómicas y Geofísicas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Económicas",
      img: "assets/custom/images/ComCol/fce.png",
      href: "/handle/10915/33",
      description: "Ciencias Económicas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Exactas",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/22",
      description: "Ciencias Exactas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Jurídicas y Sociales",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/7",
      description: "Ciencias Jurídicas y Sociales",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Médicas",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/44",
      description: "Ciencias Médicas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Naturales y Museo",
      img: "assets/custom/images/ComCol/museo.png",
      href: "/handle/10915/41",
      description: "Ciencias Naturales y Museo",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Veterinarias",
      img: "assets/custom/images/ComCol/veterinaria.png",
      href: "/handle/10915/5",
      description: "Ciencias Veterinarias",
    } as ExploracionDestacada,
    {
      title: "Facultad de Humanidades y Ciencias de la Educación",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/30",
      description: "Humanidades y Ciencias de la Educación",
    } as ExploracionDestacada,
    {
      title: "Facultad de Informática",
      img: "assets/custom/images/ComCol/informatica.png",
      href: "/handle/10915/36",
      description: "Informática",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ingeniería",
      img: "assets/custom/images/ComCol/ing.png",
      href: "/handle/10915/2",
      description: "Ingeniería",
    } as ExploracionDestacada,
    {
      title: "Facultad de Odontología",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/20",
      description: "Odontología",
    } as ExploracionDestacada,
    {
      title: "Facultad de Periodismo y Comunicación Social",
      img: "assets/custom/images/ComCol/periodismo.png",
      href: "/handle/10915/12",
      description: "Periodismo y Comunicación Social",
    } as ExploracionDestacada,
    {
      title: "Facultad de Psicología",
      img: "assets/custom/images/ComCol/psicologia.png",
      href: "/handle/10915/28",
      description: "Psicología",
    } as ExploracionDestacada,
    {
      title: "Facultad de Trabajo Social",
      img: "assets/custom/images/ComCol/fts.png",
      href: "/handle/10915/18",
      description: "Trabajo Social",
    } as ExploracionDestacada,
    {
      title: "Escuela Universitaria de Oficios",
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/102525",
      description: "Escuela Universitaria de Oficios",
    } as ExploracionDestacada,
  ];

  pregrado:Array<ExploracionDestacada> = [
    {
      title: 'Bachillerato de Bellas Artes "Francisco A. De Santo"',
      img: "assets/custom/images/ComCol/bachillerato.png",
      href: "/handle/10915/71503",
      description: 'Bachillerato de Bellas Artes "Francisco A. De Santo"',
    } as ExploracionDestacada,
    {
      title: 'Colegio Nacional "Rafael Hernández"',
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/65311",
      description: 'Colegio Nacional "Rafael Hernández"',
    } as ExploracionDestacada,
    {
      title: 'Escuela de Agricultura y Ganadería "María Cruz y Manuel L. Inchausti"',
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/155239",
      description: 'Escuela de Agricultura y Ganadería "María Cruz y Manuel L. Inchausti"',
    } as ExploracionDestacada,
    {
      title: 'Escuela Graduada "Joaquín V. González"',
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/74301",
      description: 'Escuela Graduada "Joaquín V. González"',
    } as ExploracionDestacada,
    {
      title: 'Liceo "Víctor Mercante"',
      img: "assets/custom/images/ComCol/UNLP_Logo.png",
      href: "/handle/10915/73404",
      description: 'Liceo "Víctor Mercante"',
    } as ExploracionDestacada,
  ];
}
