import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { addDoc, collection, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

export type HomePageContent = {
  title: string;
  subtitle: string;
  description: string;
};

export type SimplePageContent = {
  title: string;
  subtitle: string;
  description: string;
};

export type ServiceContent = {
  title: string;
  description: string;
};

export type HomeSectionItem = {
  title: string;
  subtitle: string;
  description: string;
  items?: string[];
  imageUrl?: string;
  secondaryImageUrl?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  trustText?: string;
};

export type HomeSectionsContent = {
  hero: HomeSectionItem;
  services: HomeSectionItem;
  countries: HomeSectionItem;
  whyChoose: HomeSectionItem;
  howItWorks: HomeSectionItem;
  testimonials: HomeSectionItem;
  finalCta: HomeSectionItem;
};

export type CustomSection = {
  id?: string;
  key: string;
  title: string;
  subtitle: string;
  description: string;
  sectionType?: 'banner' | 'cards';
  targetPage?: 'home' | 'about-us' | 'services' | 'contact-us';
  homePlacement?:
    | 'top'
    | 'after-hero'
    | 'after-services'
    | 'after-countries'
    | 'after-why-choose'
    | 'after-how-it-works'
    | 'after-testimonials'
    | 'after-final-cta'
    | 'bottom';
  backgroundImageUrl?: string;
  heading1?: string;
  heading2?: string;
  paragraph?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonIcon?: string;
  cardsPerRow?: 3 | 4;
  cards?: CustomSectionCard[];
  createdAt: string;
};

export type CustomSectionCard = {
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImageUrl?: string;
};

export type AboutPageContent = {
  heroTitle: string;
  heroSubtitle: string;
  whoTitle: string;
  whoParagraph1: string;
  whoParagraph2: string;
  whoParagraph3: string;
  countriesTitle: string;
  countriesSubtitle: string;
  teamTitle: string;
  teamSubtitle: string;
  teamMembers: AboutTeamMember[];
};

export type AboutTeamMember = {
  name: string;
  role: string;
  whatsappUrl: string;
};

export type ServiceCardContent = {
  title: string;
  description: string;
  icon: string;
};

export type ServicesPageContent = {
  heroTitle: string;
  heroSubtitle: string;
  gridTitle: string;
  gridSubtitle: string;
  cards: ServiceCardContent[];
};

export type ContactPageContent = {
  heroTitle: string;
  heroSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  visitTitle: string;
  visitDescription: string;
  mapQuery: string;
};

export type CountryInfoItem = {
  slug: string;
  name: string;
  flag: string;
  heroImage: string;
  intro: string;
  sectors: string;
  support: string;
  guidance: string;
};

export type CountryInfoPageContent = {
  title: string;
  subtitle: string;
  countries: CountryInfoItem[];
};

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private readonly firestore: Firestore) {}

  // Required API for pages/home document.
  createHomePage(): Promise<void> {
    const homeRef = doc(this.firestore, 'pages/home');
    return setDoc(homeRef, {
      title: 'Explore Pakistan',
      subtitle: 'Best Travel Agency',
      description: 'We provide amazing travel experiences',
    } satisfies HomePageContent);
  }

  getHomePage(): Observable<HomePageContent> {
    const homeRef = doc(this.firestore, 'pages/home');
    return docData(homeRef) as Observable<HomePageContent>;
  }

  updateHomePage(payload: Partial<HomePageContent>): Promise<void> {
    const homeRef = doc(this.firestore, 'pages/home');
    return setDoc(homeRef, payload, { merge: true }).then(() =>
      getDocFromServer(homeRef).then(() => void 0)
    );
  }

  createDefaultPagesAndServices(): Promise<void[]> {
    const writes: Array<Promise<void>> = [
      setDoc(doc(this.firestore, 'pages/home'), {
        title: 'Explore Pakistan',
        subtitle: 'Best Travel Agency',
        description: 'We provide amazing travel experiences',
      } satisfies HomePageContent),
      setDoc(doc(this.firestore, 'pages/about'), {
        title: 'About WADAN',
        subtitle: 'Trusted Overseas Employment Promoters',
        description: 'We connect skilled professionals with verified global opportunities.',
      } satisfies SimplePageContent),
      setDoc(doc(this.firestore, 'pages/about_page'), this.getDefaultAboutPage()),
      setDoc(doc(this.firestore, 'pages/services_page'), this.getDefaultServicesPage()),
      setDoc(doc(this.firestore, 'pages/contact'), {
        title: 'Contact Us',
        subtitle: 'Start Your Overseas Journey',
        description: 'Reach out to our team for guidance on jobs and visa processing.',
      } satisfies SimplePageContent),
      setDoc(doc(this.firestore, 'pages/contact_page'), this.getDefaultContactPage()),
      setDoc(doc(this.firestore, 'pages/country_info'), this.getDefaultCountryInfoPage()),
      setDoc(doc(this.firestore, 'services/service1'), {
        title: 'Overseas Job Placement',
        description: 'Get matched with verified employers in top hiring destinations.',
      }),
      setDoc(doc(this.firestore, 'services/service2'), {
        title: 'Work Visa Processing',
        description: 'Complete assistance for filing, tracking, and approval workflow.',
      }),
      setDoc(doc(this.firestore, 'services/service3'), {
        title: 'Document Assistance',
        description: 'Accurate documentation support before submission and travel.',
      }),
      setDoc(doc(this.firestore, 'pages/home_sections'), this.getDefaultHomeSections()),
    ];

    return Promise.all(writes);
  }

  getPage(documentId: 'home' | 'about' | 'contact'): Observable<SimplePageContent> {
    const pageRef = doc(this.firestore, `pages/${documentId}`);
    return docData(pageRef) as Observable<SimplePageContent>;
  }

  updatePage(
    documentId: 'home' | 'about' | 'contact',
    payload: Partial<SimplePageContent>
  ): Promise<void> {
    const pageRef = doc(this.firestore, `pages/${documentId}`);
    return setDoc(pageRef, payload, { merge: true }).then(() =>
      getDocFromServer(pageRef).then(() => void 0)
    );
  }

  getDefaultPage(documentId: 'home' | 'about' | 'contact'): SimplePageContent {
    if (documentId === 'home') {
      return {
        title: 'Explore Pakistan',
        subtitle: 'Best Travel Agency',
        description: 'We provide amazing travel experiences',
      };
    }
    if (documentId === 'about') {
      return {
        title: 'About WADAN',
        subtitle: 'Trusted Overseas Employment Promoters',
        description: 'We connect skilled professionals with verified global opportunities.',
      };
    }
    return {
      title: 'Contact Us',
      subtitle: 'Start Your Overseas Journey',
      description: 'Reach out to our team for guidance on jobs and visa processing.',
    };
  }

  getService(
    documentId: 'service1' | 'service2' | 'service3'
  ): Observable<ServiceContent> {
    const serviceRef = doc(this.firestore, `services/${documentId}`);
    return docData(serviceRef) as Observable<ServiceContent>;
  }

  updateService(
    documentId: 'service1' | 'service2' | 'service3',
    payload: Partial<ServiceContent>
  ): Promise<void> {
    const serviceRef = doc(this.firestore, `services/${documentId}`);
    return setDoc(serviceRef, payload, { merge: true }).then(() =>
      getDocFromServer(serviceRef).then(() => void 0)
    );
  }

  getDefaultService(documentId: 'service1' | 'service2' | 'service3'): ServiceContent {
    if (documentId === 'service1') {
      return {
        title: 'Overseas Job Placement',
        description: 'Get matched with verified employers in top hiring destinations.',
      };
    }
    if (documentId === 'service2') {
      return {
        title: 'Work Visa Processing',
        description: 'Complete assistance for filing, tracking, and approval workflow.',
      };
    }
    return {
      title: 'Document Assistance',
      description: 'Accurate documentation support before submission and travel.',
    };
  }

  getCustomSections(): Observable<CustomSection[]> {
    const sectionsRef = collection(this.firestore, 'sections');
    return collectionData(sectionsRef, { idField: 'id' }) as Observable<CustomSection[]>;
  }

  addCustomSection(payload: {
    key: string;
    title: string;
    subtitle: string;
    description: string;
    sectionType?: 'banner' | 'cards';
    targetPage?: 'home' | 'about-us' | 'services' | 'contact-us';
    homePlacement?:
      | 'top'
      | 'after-hero'
      | 'after-services'
      | 'after-countries'
      | 'after-why-choose'
      | 'after-how-it-works'
      | 'after-testimonials'
      | 'after-final-cta'
      | 'bottom';
    backgroundImageUrl?: string;
    heading1?: string;
    heading2?: string;
    paragraph?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonIcon?: string;
    cardsPerRow?: 3 | 4;
    cards?: CustomSectionCard[];
  }): Promise<void> {
    const sectionsRef = collection(this.firestore, 'sections');
    return addDoc(sectionsRef, {
      ...payload,
      createdAt: new Date().toISOString(),
    }).then(() => void 0);
  }

  updateCustomSection(
    sectionId: string,
    payload: Partial<Pick<CustomSection, 'title' | 'subtitle' | 'description'>>
  ): Promise<void> {
    const sectionRef = doc(this.firestore, `sections/${sectionId}`);
    return setDoc(sectionRef, payload, { merge: true }).then(() =>
      getDocFromServer(sectionRef).then(() => void 0)
    );
  }

  createHomeSections(): Promise<void> {
    const sectionRef = doc(this.firestore, 'pages/home_sections');
    return setDoc(sectionRef, this.getDefaultHomeSections());
  }

  getHomeSections(): Observable<HomeSectionsContent> {
    const sectionRef = doc(this.firestore, 'pages/home_sections');
    return docData(sectionRef) as Observable<HomeSectionsContent>;
  }

  async getHomeSectionsFromServer(): Promise<Partial<HomeSectionsContent>> {
    const sectionRef = doc(this.firestore, 'pages/home_sections');
    const snapshot = await getDocFromServer(sectionRef);
    return (snapshot.data() ?? {}) as Partial<HomeSectionsContent>;
  }

  updateHomeSections(payload: Partial<HomeSectionsContent>): Promise<void> {
    const sectionRef = doc(this.firestore, 'pages/home_sections');
    return setDoc(sectionRef, payload, { merge: true }).then(() =>
      getDocFromServer(sectionRef).then(() => void 0)
    );
  }

  replaceHomeSections(payload: HomeSectionsContent): Promise<void> {
    const sectionRef = doc(this.firestore, 'pages/home_sections');
    return setDoc(sectionRef, payload).then(() => getDocFromServer(sectionRef).then(() => void 0));
  }

  getDefaultHomeSections(): HomeSectionsContent {
    return {
      hero: {
        title: 'WADAN Overseas Employment Promoters',
        subtitle: 'Trusted Overseas Recruitment and Visa Consultancy',
        description:
          'WADAN Overseas Employment Promoters connects skilled professionals with global employment opportunities through transparent recruitment and visa processing support.',
        imageUrl: '/sliderimg2.avif',
        secondaryImageUrl: '/travel.png',
      },
      services: {
        title: 'Our Key Services',
        subtitle: 'Preview Only',
        description: 'Showcasing our main support areas for overseas employment and visa processing.',
        items: [
          'Overseas Job Placement',
          'Work Visa Processing',
          'Document Assistance',
          'Employer Coordination',
        ],
      },
      countries: {
        title: 'Countries We Serve',
        subtitle: 'International Destinations',
        description: 'We actively support candidates and employers across multiple international destinations.',
        items: [
          'United Arab Emirates',
          'Saudi Arabia',
          'Qatar',
          'Oman',
          'Bahrain',
          'Iraq',
        ],
      },
      whyChoose: {
        title: 'Why Choose Us',
        subtitle: 'Trusted Process',
        description: 'This is why clients trust WADAN for overseas employment and visa solutions.',
        items: [
          'Transparent & Ethical Recruitment',
          'Verified International Employers',
          'Fast & Secure Visa Processing',
          'Complete End-to-End Support',
        ],
      },
      howItWorks: {
        title: 'How It Works',
        subtitle: 'Simple Transparent Steps',
        description: 'Simple, transparent steps from registration to successful deployment.',
        items: ['Register', 'Interview', 'Offer Letter', 'Visa Processing', 'Travel & Deployment'],
      },
      testimonials: {
        title: 'What Our Clients Say',
        subtitle: 'Real Candidate Experiences',
        description: 'Real experiences from candidates we placed across international employers.',
      },
      finalCta: {
        title: 'Ready to Work Abroad?',
        subtitle: 'Take the next step',
        description:
          'Start your international career journey today with trusted guidance for overseas employment and work visa processing.',
        primaryButtonText: 'Apply Now',
        secondaryButtonText: 'Contact Our Team Today',
        trustText: '100% Transparent Process | Verified International Employers',
      },
    };
  }

  createAboutPage(): Promise<void> {
    return setDoc(doc(this.firestore, 'pages/about_page'), this.getDefaultAboutPage());
  }

  getAboutPage(): Observable<AboutPageContent> {
    return docData(doc(this.firestore, 'pages/about_page')) as Observable<AboutPageContent>;
  }

  updateAboutPage(payload: Partial<AboutPageContent>): Promise<void> {
    const ref = doc(this.firestore, 'pages/about_page');
    return setDoc(ref, payload, { merge: true }).then(() => getDocFromServer(ref).then(() => void 0));
  }

  getDefaultAboutPage(): AboutPageContent {
    return {
      heroTitle: 'About WADAN Overseas Employment Promoters',
      heroSubtitle: 'Connecting Skilled Professionals to Global Opportunities',
      whoTitle: 'Who We Are',
      whoParagraph1:
        'WADAN Overseas Employment Promoters is an experienced overseas employment and visa consultancy focused on connecting skilled professionals with trusted international opportunities. Over the years, we have supported candidates and employers through a structured and reliable recruitment process.',
      whoParagraph2:
        'We specialize in overseas job placement and work visa processing, with complete support for documentation, employer coordination, and pre-departure guidance. Our team is committed to ethical, transparent, and government-compliant recruitment practices at every step.',
      whoParagraph3:
        'We actively serve major hiring markets in the Gulf and Europe, including UAE, Saudi Arabia, Qatar, Oman, Poland, and Romania.',
      countriesTitle: 'Countries We Serve',
      countriesSubtitle: 'Connecting Talent to Opportunities Across the Globe.',
      teamTitle: 'Our Dedicated Team',
      teamSubtitle: 'Professionals Committed to Your Global Career.',
      teamMembers: [
        {
          name: 'Siddiq Ahmad',
          role: 'Sales Representative',
          whatsappUrl: 'https://wa.me/923001234567',
        },
        {
          name: 'Shah Baz',
          role: 'Marketing Manager',
          whatsappUrl: 'https://wa.me/923001234567',
        },
        {
          name: 'Shah Zaib Safi',
          role: 'CEO',
          whatsappUrl: 'https://wa.me/923001234567',
        },
        {
          name: 'Sajid Khan',
          role: 'Manager',
          whatsappUrl: 'https://wa.me/923001234567',
        },
      ],
    };
  }

  createServicesPage(): Promise<void> {
    return setDoc(doc(this.firestore, 'pages/services_page'), this.getDefaultServicesPage());
  }

  getServicesPage(): Observable<ServicesPageContent> {
    return docData(doc(this.firestore, 'pages/services_page')) as Observable<ServicesPageContent>;
  }

  updateServicesPage(payload: Partial<ServicesPageContent>): Promise<void> {
    const ref = doc(this.firestore, 'pages/services_page');
    return setDoc(ref, payload, { merge: true }).then(() => getDocFromServer(ref).then(() => void 0));
  }

  getDefaultServicesPage(): ServicesPageContent {
    return {
      heroTitle: 'Our Services',
      heroSubtitle: 'Professional Overseas Employment & Visa Solutions',
      gridTitle: 'Our Key Services',
      gridSubtitle: 'End-to-End Solutions for Your Overseas Career.',
      cards: [
        {
          title: 'Overseas Job Placement',
          description: 'Connecting candidates to verified international employers in Gulf and Europe.',
          icon: 'fa-solid fa-briefcase',
        },
        {
          title: 'Work Visa Processing',
          description: 'Complete visa documentation and compliance support for a smooth approval process.',
          icon: 'fa-solid fa-passport',
        },
        {
          title: 'Document Attestation & Legalization',
          description: 'Ensuring certificates and documents are properly attested for overseas employment.',
          icon: 'fa-solid fa-file-signature',
        },
        {
          title: 'Employer Coordination',
          description: 'Liaising between candidates and international companies for interviews and offers.',
          icon: 'fa-solid fa-users-between-lines',
        },
        {
          title: 'Travel & Relocation Assistance',
          description: 'Guidance for smooth relocation including travel planning and initial accommodation support.',
          icon: 'fa-solid fa-plane-departure',
        },
      ],
    };
  }

  createContactPage(): Promise<void> {
    return setDoc(doc(this.firestore, 'pages/contact_page'), this.getDefaultContactPage());
  }

  getContactPage(): Observable<ContactPageContent> {
    return docData(doc(this.firestore, 'pages/contact_page')) as Observable<ContactPageContent>;
  }

  updateContactPage(payload: Partial<ContactPageContent>): Promise<void> {
    const ref = doc(this.firestore, 'pages/contact_page');
    return setDoc(ref, payload, { merge: true }).then(() => getDocFromServer(ref).then(() => void 0));
  }

  getDefaultContactPage(): ContactPageContent {
    return {
      heroTitle: 'Get in Touch with Us',
      heroSubtitle: 'We\u2019re Here to Assist You With Your Overseas Career',
      formTitle: 'Send Us a Message',
      formSubtitle: 'Share your details and our team will guide you for overseas job and visa solutions.',
      visitTitle: 'Visit Us',
      visitDescription:
        'Our Office Location: Muqam Chowk, Mardan, Pakistan. You are always welcome to visit us or contact our team for trusted guidance on overseas jobs and visa services.',
      mapQuery: 'Muqam Chowk Mardan Pakistan',
    };
  }

  createCountryInfoPage(): Promise<void> {
    return setDoc(doc(this.firestore, 'pages/country_info'), this.getDefaultCountryInfoPage());
  }

  getCountryInfoPage(): Observable<CountryInfoPageContent> {
    return docData(doc(this.firestore, 'pages/country_info')) as Observable<CountryInfoPageContent>;
  }

  updateCountryInfoPage(payload: Partial<CountryInfoPageContent>): Promise<void> {
    const ref = doc(this.firestore, 'pages/country_info');
    return setDoc(ref, payload, { merge: true }).then(() => getDocFromServer(ref).then(() => void 0));
  }

  getDefaultCountryInfoPage(): CountryInfoPageContent {
    return {
      title: 'Country Information',
      subtitle: 'Explore overseas employment opportunities by destination.',
      countries: [
        {
          slug: 'uae',
          name: 'United Arab Emirates',
          flag: '&#x1F1E6;&#x1F1EA;',
          heroImage: '/uae.avif',
          intro:
            'UAE is a major hiring destination for overseas workers across technical, service, and infrastructure roles. WADAN supports complete placement and visa workflow for UAE opportunities.',
          sectors:
            'Construction, MEP, driving, hospitality, facility management, and retail operations.',
          support:
            'Job matching, interview scheduling, offer letter verification, and visa file preparation.',
          guidance:
            'Document checklist review, pre-departure orientation, and onboarding readiness support.',
        },
        {
          slug: 'saudi-arabia',
          name: 'Saudi Arabia',
          flag: '&#x1F1F8;&#x1F1E6;',
          heroImage: '/saudi.avif',
          intro:
            'Saudi Arabia offers large-scale opportunities in industrial, construction, and service sectors. WADAN helps candidates move through recruitment and visa processing with clear steps.',
          sectors:
            'Construction, oil and gas support, heavy equipment, warehousing, and hospitality.',
          support:
            'Employer coordination, contract review support, document preparation, and visa submission.',
          guidance:
            'Travel preparation, process updates, and deployment support before departure.',
        },
        {
          slug: 'qatar',
          name: 'Qatar',
          flag: '&#x1F1F6;&#x1F1E6;',
          heroImage: '/qatar.avif',
          intro:
            'Qatar continues to hire skilled and semi-skilled professionals in multiple project-driven sectors. WADAN assists candidates through verified and transparent recruitment channels.',
          sectors:
            'Infrastructure, logistics, facility management, hospitality, and technical trades.',
          support:
            'Candidate profiling, employer interviews, documentation control, and visa case handling.',
          guidance: 'Pre-travel briefings and practical guidance for smoother transition.',
        },
        {
          slug: 'oman',
          name: 'Oman',
          flag: '&#x1F1F4;&#x1F1F2;',
          heroImage: '/oman.avif',
          intro:
            'Oman provides stable roles for overseas workers in operations and skilled trades. WADAN helps candidates access opportunities with structured end-to-end support.',
          sectors: 'Maintenance, transport, construction support, hospitality, and operations.',
          support:
            'Job opportunity matching, document verification, and work visa filing support.',
          guidance: 'Readiness checks and candidate support from selection to departure.',
        },
        {
          slug: 'bahrain',
          name: 'Bahrain',
          flag: '&#x1F1E7;&#x1F1ED;',
          heroImage: '/bahrain.avif',
          intro:
            'Bahrain is a focused market for workforce demand across services and technical fields. WADAN helps applicants complete hiring and visa procedures accurately and on time.',
          sectors: 'Hospitality, technical maintenance, transport, and support services.',
          support: 'Offer processing, document preparation, and visa application coordination.',
          guidance:
            'Step-by-step guidance through pre-departure compliance and travel preparation.',
        },
        {
          slug: 'iraq',
          name: 'Iraq',
          flag: '&#x1F1EE;&#x1F1F6;',
          heroImage: '/iraq.avif',
          intro:
            'Iraq offers project-based opportunities for skilled workers in operations and site-support roles. WADAN manages a transparent process from employer selection to deployment.',
          sectors: 'Construction support, mechanical roles, logistics, and site operations.',
          support:
            'Profile screening, interview support, paperwork handling, and visa processing.',
          guidance:
            'Travel readiness, onboarding awareness, and deployment follow-up guidance.',
        },
      ],
    };
  }
}
