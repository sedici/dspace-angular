import { NgTemplateOutlet } from '@angular/common';

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { filter, map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommunityDataService } from 'src/app/core/data/community-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleCarouselComponent } from './simple-carousel/simple-carousel.component';

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
  imports: [NgTemplateOutlet, TranslateModule, SimpleCarouselComponent],
})
export class ComcolGridComponent implements OnInit {

  apiBase = '/api';
  defaultColor = '#cccccc';

  constructor(
    private communityDataService: CommunityDataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.assignColorsFromCommunities();
  }

  private parseHandleFromHref(href: string): string | null {
    const m = href?.match(/\/handle\/([^\/]+\/[^\/\?]+)/);
    return m ? m[1] : null;
  }

  private assignColorsFromMap(handleColor: Map<string, string|null>): void {
    const all = [...this.facultades, ...this.pregrado];
    all.forEach(item => {
      const h = this.parseHandleFromHref(item.href);
      const color = h ? (handleColor.get(h) ?? null) : null;
      (item as any).color = color ?? this.defaultColor;
    });
    this.cdr.detectChanges();
  }

  private assignColorsFromCommunities(): void {
    this.communityDataService.findTop({ elementsPerPage: 15 }).pipe(
      filter((rd: any) => !!rd && rd.hasSucceeded),
      take(1),
      map((rd: any) => {
        const list = rd.payload?.page ?? [];
        return list.find((c: any) => {
          const uri = c?.metadata?.['dc.identifier.uri']?.[0]?.value;
          const handle = this.parseHandleFromHref(uri);
          return handle === '10915/1';
        }) ?? null;
      }),
      switchMap((parent: any) => {
        const parentUUID = parent?.uuid ?? parent?.id ?? null;
        return this.communityDataService.getEndpoint().pipe(
          take(1),
          map((endpoint: string) => `${endpoint}/${parentUUID}/subcommunities`),
          switchMap((href: string) => this.communityDataService.findListByHref(href, { elementsPerPage: 500 }, true, true)),
          filter((rd: any) => !!rd && rd.hasSucceeded),
          take(1),
          map((rd: any) => rd.payload?._embedded?.communities ?? rd.payload?.page ?? [])
        );
      })
    ).subscribe((communities: any[]) => {
      const handleColor = new Map<string, string|null>();
      communities.forEach(c => {
        const handle: string | undefined = c?.handle;
        const color = c?.metadata?.['sedici.comcol.color']?.[0]?.value ?? null;
        if (handle) handleColor.set(this.parseHandleFromHref(handle), color);
      });
      this.assignColorsFromMap(handleColor);
    }, err => {
      console.error('Error recuperando communities hijas', err);
      [...this.facultades, ...this.pregrado].forEach(i => (i as any).color = this.defaultColor);
    });
  }
  
    


  coleccionesDestacadasUnlp:Array<ExploracionDestacada> = [
    {
      title: "Dirección PREBI-SEDICI",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/prebisedici.svg",
      href: "handle/10915/25293",
    } as ExploracionDestacada,
    {
      title: "Red de Museos de la UNLP",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/redmuseos.svg",
      href: "handle/10915/27268",
    } as ExploracionDestacada,
    {
      title: "Biblioteca Pública",
      img: "assets/custom/images/ComCol/biblioteca.png",
      href: "handle/10915/81791",
    } as ExploracionDestacada,
    {
      title: "Archivo Histórico",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/Archivo Historico.svg",
      href: "handle/10915/131410",
    } as ExploracionDestacada,
    {
      title: "Presidencia",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/UNLP_Logo.png",
      href: "handle/10915/47",
    } as ExploracionDestacada,
    {
      title: "Editorial de la Universidad Nacional de La Plata (EDULP)",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/Edulp.svg",
      href: "handle/10915/18248",
    } as ExploracionDestacada,
    {
      title: "Libros de Cátedra",
      img: "assets/custom/images/ComCol/libros.png",
      href: "handle/10915/27874",
    } as ExploracionDestacada,
    {
      title: "Radio Universidad Nacional de La Plata",
      img: "assets/custom/images/ComCol/radiouniversidad.svg",
      href: "handle/10915/25224",
    } as ExploracionDestacada,
    {
      title: "Dirección General de Educación a Distancia y Tecnologías (EAD)",
      img: "assets/custom/images/ComCol/ead.png",
      href: "handle/10915/21328",
    } as ExploracionDestacada,
  ];

  coleccionesDestacadasOtras:Array<ExploracionDestacada> = [
    {
      title: "Red de Universidades con Carreras en Informática (RedUNCI)",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/redunci.png",
      href: "handle/10915/18267",
    } as ExploracionDestacada,
    {
      title: "Sociedad Argentina de Informática (SADIO)",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/sadio.jpg",
      href: "handle/10915/38367",
    } as ExploracionDestacada,
    {
      title: "Academia Nacional de Agronomía y Veterinaria (ANAV)",
      img: "assets/custom/images/ComCol/anav.jpg",
      href: "handle/10915/27489",
    } as ExploracionDestacada,
    {
      title: "Consorcio Iberoamericano para Educación en Ciencia y Tecnología (ISTEC)",
      img: "assets/custom/images/ComCol/Colecciones Destacadas/ISTEC.svg",
      href: "handle/10915/72659",
    } as ExploracionDestacada,
  ];

  facultades:Array<ExploracionDestacada> = [
    {
      title: "Facultad de Arquitectura y Urbanismo",
      img: "assets/custom/images/ComCol/Facultades/FAU.svg",
      href: "/handle/10915/25",
      description: "Arquitectura y Urbanismo",
    } as ExploracionDestacada,
    {
      title: "Facultad de Artes",
      img: "assets/custom/images/ComCol/Facultades/Artes.svg",
      href: "/handle/10915/38",
      description: "Artes",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Agrarias y Forestales",
      img: "assets/custom/images/ComCol/Facultades/fca.png",
      href: "/handle/10915/10",
      description: "Ciencias Agrarias y Forestales",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Astronómicas y Geofísicas",
      img: "assets/custom/images/ComCol/Facultades/astronomia.png",
      href: "/handle/10915/15",
      description: "Ciencias Astronómicas y Geofísicas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Económicas",
      img: "assets/custom/images/ComCol/Facultades/fce.png",
      href: "/handle/10915/33",
      description: "Ciencias Económicas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Exactas",
      img: "assets/custom/images/ComCol/Facultades/exactas.png",
      href: "/handle/10915/22",
      description: "Ciencias Exactas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Jurídicas y Sociales",
      img: "assets/custom/images/ComCol/Facultades/Juridicas-y-sociales.png",
      href: "/handle/10915/7",
      description: "Ciencias Jurídicas y Sociales",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Médicas",
      img: "assets/custom/images/ComCol/Facultades/ciencias-medicas.png",
      href: "/handle/10915/44",
      description: "Ciencias Médicas",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Naturales y Museo",
      img: "assets/custom/images/ComCol/Facultades/museo.png",
      href: "/handle/10915/41",
      description: "Ciencias Naturales y Museo",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ciencias Veterinarias",
      img: "assets/custom/images/ComCol/Facultades/veterinaria.png",
      href: "/handle/10915/5",
      description: "Ciencias Veterinarias",
    } as ExploracionDestacada,
    {
      title: "Facultad de Humanidades y Ciencias de la Educación",
      img: "assets/custom/images/ComCol/Facultades/FaHCE.jpg",
      href: "/handle/10915/30",
      description: "Humanidades y Ciencias de la Educación",
    } as ExploracionDestacada,
    {
      title: "Facultad de Informática",
      img: "assets/custom/images/ComCol/Facultades/informatica.png",
      href: "/handle/10915/36",
      description: "Informática",
    } as ExploracionDestacada,
    {
      title: "Facultad de Ingeniería",
      img: "assets/custom/images/ComCol/Facultades/Ingenieria.svg",
      href: "/handle/10915/2",
      description: "Ingeniería",
    } as ExploracionDestacada,
    {
      title: "Facultad de Odontología",
      img: "assets/custom/images/ComCol/Facultades/odontologia.png",
      href: "/handle/10915/20",
      description: "Odontología",
    } as ExploracionDestacada,
    {
      title: "Facultad de Periodismo y Comunicación Social",
      img: "assets/custom/images/ComCol/Facultades/periodismo.png",
      href: "/handle/10915/12",
      description: "Periodismo y Comunicación Social",
    } as ExploracionDestacada,
    {
      title: "Facultad de Psicología",
      img: "assets/custom/images/ComCol/Facultades/Psicología.svg",
      href: "/handle/10915/28",
      description: "Psicología",
    } as ExploracionDestacada,
    {
      title: "Facultad de Trabajo Social",
      img: "assets/custom/images/ComCol/Facultades/fts.png",
      href: "/handle/10915/18",
      description: "Trabajo Social",
    } as ExploracionDestacada,
    {
      title: "Escuela Universitaria de Oficios",
      img: "assets/custom/images/ComCol/Facultades/oficios.jpg",
      href: "/handle/10915/102525",
      description: "Escuela Universitaria de Oficios",
    } as ExploracionDestacada,
  ];

  pregrado:Array<ExploracionDestacada> = [
    {
      title: 'Bachillerato de Bellas Artes "Francisco A. De Santo"',
      img: "assets/custom/images/ComCol/Pregrado/logobachillerato.png",
      href: "/handle/10915/71503",
      description: 'Bachillerato de Bellas Artes "Francisco A. De Santo"',
    } as ExploracionDestacada,
    {
      title: 'Colegio Nacional "Rafael Hernández"',
      img: "assets/custom/images/ComCol/Pregrado/logonacional.png",
      href: "/handle/10915/65311",
      description: 'Colegio Nacional "Rafael Hernández"',
    } as ExploracionDestacada,
    {
      title: 'Escuela de Agricultura y Ganadería "María Cruz y Manuel L. Inchausti"',
      img: "assets/custom/images/ComCol/Pregrado/logoinchausti.png",
      href: "/handle/10915/155239",
      description: 'Escuela de Agricultura y Ganadería "María Cruz y Manuel L. Inchausti"',
    } as ExploracionDestacada,
    {
      title: 'Escuela Graduada "Joaquín V. González"',
      img: "assets/custom/images/ComCol/Pregrado/logojvg.png",
      href: "/handle/10915/74301",
      description: 'Escuela Graduada "Joaquín V. González"',
    } as ExploracionDestacada,
    {
      title: 'Liceo "Víctor Mercante"',
      img: "assets/custom/images/ComCol/Pregrado/logoliceo.png",
      href: "/handle/10915/73404",
      description: 'Liceo "Víctor Mercante"',
    } as ExploracionDestacada,
  ];
}
