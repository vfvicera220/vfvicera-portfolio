"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { SocialIcon } from 'react-social-icons'

import Typewriter from "./components/Typewriter";
import SectionHeader from "./components/SectionHeader";
import WorkExperienceItem from "./components/WorkExperienceItem";
import SkillItem from "./components/SkillItem";

import siteLogo from "./assets/memoji/site_logo.png";
import memoji1 from "./assets/memoji/memoji1.svg";
import densoLogo from './assets/dtph.png';
import twistRes from './assets/twist.png';
import gitLogo from './assets/Git-Icon-1788C.png';
import reactJsLogo from './assets/logo_dark.svg';
import springbootLogo from './assets/springboot.png';
import postgreSQLLogo from './assets/Postgresql_elephant.svg';
import pythonLogo from './assets/Python-logo-notext.svg.png';
import gitlabLogoDark from './assets/gitlab-logo-100.svg';
import gitHubLogoDark from './assets/github-mark.png';
import jiraLogo from './assets/logo-gradient-blue-jira.svg';
import javaLogo from './assets/Java_programming_language_logo.svg.png';
import htmlCssJsLogo from './assets/html-logo-png-1.png';
import tailWindLogo from './assets/tailwindcss-icon.svg';
import nextjsLogo from './assets/nextjs-logo.svg';

const navigation = [
  { name: "About", href: "#" },
  { name: "Tech Stack", href: "#tech-stack-section" },
  { name: "Experience", href: "#experience-section" },
  { name: "Contact", href: "#contact-section" },
];
const socialLinks = [
  // { href: "https://facebook.com" },
  { href: "https://github.com/vfvicera220" },
  { href: "https://www.linkedin.com/in/kvicera/" },
  { network: "email", href: "mailto:vfvicera220@gmail.com" }
];
const workExpStartYear = 2019;
const skillData = [
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "ReactJs & React Native",
    logo: reactJsLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "Springboot",
    logo: springbootLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "PostgreSQL",
    logo: postgreSQLLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "Java",
    logo: javaLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "HTML CSS JS",
    logo: htmlCssJsLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "Python",
    logo: pythonLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "Gitlab",
    logo: gitlabLogoDark,
  },
  {
    size: {
      width: 28,
      height: 20,
    },
    title: "Jira",
    logo: jiraLogo,
  },
  {
    size: {
      width: 28,
      height: 20,
    },
    title: "NextJS",
    logo: nextjsLogo,
  },
  {
    size: {
      width: 28,
      height: 20,
    },
    title: "TailwindCSS",
    logo: tailWindLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "Git",
    logo: gitLogo,
  },
  {
    size: {
      width: "auto",
      height: 20,
    },
    title: "GitHub",
    logo: gitHubLogoDark,
  },
];
const workExperienceData = [
  {
    logo: twistRes,
    title: "Full-stack Software Engineer at TwistResources",
    yearSpan: "2021-Present",
    description: "As a Full-stack Software Engineer at Twist Resources, I play a pivotal role in our team that caters for a real estate company based " +
    "in Australia. Collaborating with a dynamic team of engineers, I contributed to the development of functionality, stability, and efficiency of multiple web and mobile apps, allowing " +
    "banks to produce more accurate property valuations.",
    bulletPoints: [
      "ReactJS, React Native, Java, Springboot, Python",
    ],
  },
  {
    logo: densoLogo,
    title: "Software Engineer at Denso Techno Philippines, Inc.",
    yearSpan: "2019-2021",
    description: "During my tenure at DTPH as a Software Engineer, I was responsible for developing tools and scripts using C#, .NET, Visual Basic, Jenkins and Python to automate " +
    "internal business processes. Also worked on embedded systems using C# & C++ which is used on car dashboards. Participated on daily stand up meetings, project kick-offs, and code reviews.",
    bulletPoints: [
      "C#, .NET, C++, Python, Visual Basic, Jenkins",
    ],
  },
];

export default function Home() {
  const currentYear = new Date().getFullYear();
  const yearsPassed = currentYear - workExpStartYear;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  } 
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="bg-white">
      <ArrowUpCircleIcon color="black" className={`h-10 w-10 fixed bottom-4 right-4 transition duration-300 animate-pulse ${
          isVisible ? "block" : "hidden"
        }`} onClick={scrollToTop}/>
      {/* <button
        className={`fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-300 ${
          isVisible ? "block" : "hidden"
        }`}
        onClick={scrollToTop}
      >
        ↑
      </button> */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <Image
                className="hidden md:inline-block h-9 w-auto"
                src={siteLogo}
                alt=""
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {/* <Image className="h-8 w-auto" src={githubIconDark} alt={""} /> */}
          </div>
        </nav>
        <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="lg:hidden"
        >
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <Image className="h-9 w-auto" src={siteLogo} alt="" />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <div className="pb-20">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <div className="mx-auto max-w-3xl py-32 sm:py-28">
            <div className="flex mb-24 justify-center">
              <Image className="h-64 w-auto " src={memoji1} alt={""} />
            </div>

            <div className="text-center">
              <Typewriter text="Hi, I'm Victor Francis" speed={60} />
              <p className="mt-6 text-lg leading-8 text-gray-600">
                I am a seasoned full-stack software engineer with over{" "}
                {yearsPassed} years of professional experience, specializing in
                frontend development with solid backend foundation.
                <br />
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a href="#tech-stack-section" className="-m-1.5 p-1.5">
                  <ArrowDownCircleIcon
                    aria-hidden="true"
                    color="black"
                    className="h-7 w-7 animate-bounce"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Tech Stack */}
        <div
          className="relative isolate px-6 mb-36 lg:px-8"
          id="tech-stack-section"
        >
          <div className="mx-auto max-w-3xl">
            <div>
              <div className="">
                <SectionHeader title="TECH STACK" />
              </div>
              <div className="grid gap-5 md:grid-cols-3 sm:grid-cols-1 my-14">
                {skillData.map((item) => {
                  return (
                    <SkillItem
                      key={item.title}
                      title={item.title}
                      logo={item.logo}
                      logoSize={item.size}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Experience */}
        <div
          className="relative isolate px-6 mb-36 lg:px-8"
          id="experience-section"
        >
          <div className="mx-auto max-w-3xl">
            <div>
              <div>
                <SectionHeader title="EXPERIENCE" />
              </div>
              <div className="flex-col">
                {workExperienceData.map((item) => {
                  return (
                    <WorkExperienceItem
                      key={item.title}
                      description={item.description}
                      logo={item.logo}
                      title={item.title}
                      yearSpan={item.yearSpan}
                      bulletPoints={item.bulletPoints}
                    />
                  );
                })}
              </div>
            </div>
            {/* <SectionHeader title="SAMPLE WITH CUSTOM COLORS" color={{ from: '#EAB8E4', via: '#D09DD2', to: '#B77FB5' }} /> */}
          </div>
        </div>
        {/* Contact */}
        <div className="relative isolate px-6 lg:px-8" id="contact-section">
          <div className="mx-auto max-w-3xl">
            <div>
              <div>
                <SectionHeader title="CONTACT" />
              </div>
              <div className="flex-col">
                <div className="pb-12 md:pb-3 sm:mb-3 sm:flex sm:justify-center pt-5">
                  <div className="flex rounded-full justify-center px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                    {socialLinks.map((link) => {
                      return (
                        <SocialIcon
                          key={link.href}
                          network={link.network}
                          style={{
                            height: 36,
                            width: 36,
                            marginLeft: 3,
                            marginRight: 3,
                          }}
                          url={link.href}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-center">
                  <label className="text-sm text-center leading-8 text-gray-600">
                    Thanks for scrolling!
                    <br />
                    This site was made while learning NextJs & TailwindCSS.
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
