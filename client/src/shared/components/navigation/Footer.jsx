import { Link } from "react-router-dom";
import { MapPin, Mail, Heart } from "lucide-react";

import {
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

import logo from "../../../assets/logo.png";

function Footer() {
  const footerColumns = [
    {
      title: "Discover",
      links: [
        {
          label: "Home",
          path: "/",
        },
        {
          label: "Explore Shops",
          path: "/shops",
        },
        {
          label: "Explore Products",
          path: "/products",
        },
        {
          label: "Categories",
          path: "/shops",
        },
        {
          label: "About ShopLocal",
          path: "/about",
        },
      ],
    },

    {
      title: "For Shop Owners",
      links: [
        {
          label: "Register Your Shop",
          path: "/seller/register",
        },
        {
          label: "Seller Login",
          path: "/seller/login",
        },
        {
          label: "Seller Dashboard",
          path: "/dashboard",
        },
        {
          label: "Why Join ShopLocal?",
          path: "/about",
        },
        {
          label: "Community Contributions",
          path: "/contribute",
        },
        {
          label: "Super Admin Portal",
          path: "/admin/login",
        },
      ],
    },

    {
      title: "Support",
      links: [
        {
          label: "Contact Us",
          path: "/contact",
        },
        {
          label: "Frequently Asked Questions",
          path: "/faq",
        },
        {
          label: "Help Center",
          path: "/help",
        },
        {
          label: "Privacy Policy",
          path: "/privacy",
        },
        {
          label: "Terms of Service",
          path: "/terms",
        },
      ],
    },

    {
      title: "Company",
      links: [
        {
          label: "About Us",
          path: "/about",
        },
        {
          label: "Our Mission",
          path: "/about#mission",
        },
        {
          label: "How ShopLocal Works",
          path: "/about#how-it-works",
        },
        {
          label: "Community",
          path: "/contribute",
        },
        {
          label: "Contact",
          path: "/contact",
        },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#071B26] text-white">
      {/* MAIN FOOTER */}

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          {/* LEFT SECTION */}

          <div className="md:col-span-4 lg:col-span-3">
            {/* Logo */}

            <Link
              to="/"
              aria-label="ShopLocal Home"
              className="inline-flex items-center gap-3"
            >
              <img
                src={logo}
                alt="ShopLocal"
                className="h-11 w-auto rounded-lg object-contain"
              />

              <span className="text-2xl font-bold tracking-tight">
                <span className="text-[#FF8C00]">Shop</span>
                <span className="text-white">Local</span>
              </span>
            </Link>

            {/* Description */}

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Discover nearby local shops and products while
              supporting businesses in your community.
            </p>

            {/* Location */}

            <div className="mt-5 flex items-start gap-2 text-sm text-white/55">
              <MapPin
                size={17}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-[#FF8C00]"
              />

              <span>Built for local communities in India</span>
            </div>

            {/* Email */}

            <a
              href="mailto:support@shoplocal.in"
              className="mt-3 flex items-center gap-2 text-sm text-white/55 transition-colors duration-200 hover:text-[#FF8C00]"
            >
              <Mail
                size={17}
                strokeWidth={1.8}
                className="shrink-0 text-[#FF8C00]"
              />

              <span>support@shoplocal.in</span>
            </a>

            {/* Copyright */}

            <div className="mt-6 text-sm leading-6 text-white/45">
              <p>© {new Date().getFullYear()} ShopLocal.</p>

              <p>All rights reserved.</p>
            </div>

            {/* Social Media */}

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Follow Us
              </p>

              <ul className="flex flex-wrap gap-2">
                <li>
                  <SocialIcon href="#" label="X">
                    <FaXTwitter />
                  </SocialIcon>
                </li>

                <li>
                  <SocialIcon href="#" label="Facebook">
                    <FaFacebookF />
                  </SocialIcon>
                </li>

                <li>
                  <SocialIcon href="#" label="Instagram">
                    <FaInstagram />
                  </SocialIcon>
                </li>

                <li>
                  <SocialIcon href="#" label="LinkedIn">
                    <FaLinkedinIn />
                  </SocialIcon>
                </li>

                <li>
                  <SocialIcon href="#" label="YouTube">
                    <FaYoutube />
                  </SocialIcon>
                </li>

                <li>
                  <SocialIcon href="#" label="WhatsApp">
                    <FaWhatsapp />
                  </SocialIcon>
                </li>
              </ul>
            </div>
          </div>

          {/*  RIGHT SECTION */}

          <div className="md:col-span-8 lg:col-span-9">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
              {footerColumns.map((column) => (
                <FooterColumn
                  key={column.title}
                  title={column.title}
                  links={column.links}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM LINKS */}

        <div className="mt-9 border-t border-white/10 pt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:justify-center">
            <li>
              <BottomLink to="/shops" label="Shops" />
            </li>



            <li className="text-white/20">|</li>

            <li>
              <BottomLink to="/terms" label="Terms & Conditions" />
            </li>

            <li className="text-white/20">|</li>

            <li>
              <BottomLink to="/privacy" label="Privacy Policy" />
            </li>

            <li className="text-white/20">|</li>

            <li>
              <BottomLink
                to="/community-guidelines"
                label="Community Guidelines"
              />
            </li>

            <li className="text-white/20">|</li>

            <li>
              <BottomLink
                to="/admin/login"
                label="Super Admin Portal"
              />
            </li>
          </ul>
        </div>

        {/* FINAL FOOTER LINE */}

        <div className="mt-7 flex flex-col items-center justify-center gap-2 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row">
          <span className="flex items-center gap-1">
            Made
            <Heart size={14} fill="currentColor" className="text-[#FF8C00]" />
            for local communities
            <span className="italic">- by Harshal Waghmare</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* FOOTER COLUMN */

function FooterColumn({ title, links }) {
  return (
    <div>
      <h6 className="mb-5 text-xs font-bold uppercase tracking-wider text-[#FF8C00]">
        {title}
      </h6>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={`${link.label}-${link.path}`}>
            <Link
              to={link.path}
              className="text-sm text-white/55 transition-all duration-200 hover:pl-1 hover:text-[#FF8C00]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* SOCIAL ICON */

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-sm text-white/55 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF8C00] hover:bg-[#FF8C00]/10 hover:text-[#FF8C00]"
    >
      {children}
    </a>
  );
}

/* BOTTOM LINK */

function BottomLink({ to, label }) {
  return (
    <Link
      to={to}
      className="text-xs text-white/40 transition-colors duration-200 hover:text-[#FF8C00]"
    >
      {label}
    </Link>
  );
}

export default Footer;
