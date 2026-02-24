import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { banners } from '@/data/bannersMockData';

// Import carousel images
import slide1 from '@/assets/carousel img/1.png';
import slide2 from '@/assets/carousel img/2.png';
import slide3 from '@/assets/carousel img/3.png';
import heroBg from '@/assets/herobg.png';
import laptopImg from '@/assets/laptop.png';

export const Hero = () => {
    // Filter public banners
    const publicBanners = banners.filter(b => b.isActive && b.type === 'public').sort((a, b) => a.displayOrder - b.displayOrder);

    // Fallback if no banners are configured
    const displayBanners = publicBanners.length > 0 ? publicBanners : [
        { imageUrl: slide1, ctaLink: '/student/login' },
        { imageUrl: slide2, ctaLink: '/student/login' },
        { imageUrl: slide3, ctaLink: '/student/login' }
    ];

    return (
        <section className="relative">
            {/* PART 1: Carousel */}
            <div className="relative w-full pt-20 bg-gradient-to-br from-[#F3F1FF] via-[#EEF2FF] to-[#E6EEF5]">
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }}
                    loop={true}
                    className="hero-carousel"
                >
                    {displayBanners.map((banner, index) => (
                        <SwiperSlide key={index}>
                            <a href={banner.ctaLink} className="block w-full cursor-pointer">
                                <img
                                    src={banner.imageUrl}
                                    alt={`Banner ${index + 1}`}
                                    className="w-full h-auto object-cover"
                                />
                            </a>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* PART 2: Value Proposition Content - Background Image */}
            <div
                className="relative overflow-visible pt-0 pb-4 z-50 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
                        {/* LEFT SIDE - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            {/* Headline */}
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                <span className="text-gray-900">The </span>
                                <span className="text-[#8B5CF6]">Future</span>
                                <span className="text-gray-900"> of</span>
                                <br />
                                <span className="text-[#1F2937]">Exam Preparation</span>
                            </h2>

                            {/* Supporting Text */}
                            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                                Unlock your potential with India's most innovative learning platform.
                            </p>

                            {/* CTA Button */}
                            <div>
                                <Link to="/student/login">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* RIGHT SIDE - Laptop Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative h-[600px] hidden lg:flex items-center justify-center"
                        >
                            <img
                                src={laptopImg}
                                alt="Exam Edge Platform"
                                className="w-full h-auto object-contain drop-shadow-2xl scale-[1.25]"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* PART 3: FLOATING WHITE CARD - Overlaps Exam Categories 50/50 */}
                <div className="container-custom relative -mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 relative z-50"
                        style={{
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 10px 30px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)'
                        }}
                    >
                        {/* FeaturesGrid content inside the floating card */}
                        <FeaturesGrid isInsideCard={true} />
                    </motion.div>
                </div>
            </div>

            {/* Carousel Custom Styling */}
            <style>{`
                .hero-carousel {
                    width: 100%;
                }

                .hero-carousel .swiper-button-next,
                .hero-carousel .swiper-button-prev {
                    color: white;
                    background: rgba(30, 58, 138, 0.7);
                    backdrop-filter: blur(10px);
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    opacity: 0;
                }

                .hero-carousel:hover .swiper-button-next,
                .hero-carousel:hover .swiper-button-prev {
                    opacity: 1;
                }

                .hero-carousel .swiper-button-next:hover,
                .hero-carousel .swiper-button-prev:hover {
                    background: rgba(30, 58, 138, 0.9);
                    transform: scale(1.1);
                }

                .hero-carousel .swiper-button-next::after,
                .hero-carousel .swiper-button-prev::after {
                    font-size: 18px;
                    font-weight: bold;
                }

                .hero-carousel .swiper-pagination {
                    position: absolute !important;
                    bottom: 20px !important;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .hero-carousel .swiper-pagination-bullet {
                    width: 10px;
                    height: 10px;
                    background: #1E3A8A;
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }

                .hero-carousel .swiper-pagination-bullet-active {
                    width: 28px;
                    border-radius: 5px;
                    opacity: 1;
                    background: #1E3A8A;
                }

                @media (max-width: 640px) {
                    .hero-carousel .swiper-button-next,
                    .hero-carousel .swiper-button-prev {
                        width: 35px;
                        height: 35px;
                    }

                    .hero-carousel .swiper-button-next::after,
                    .hero-carousel .swiper-button-prev::after {
                        font-size: 14px;
                    }

                    .hero-carousel .swiper-pagination {
                        bottom: 15px !important;
                    }
                }
            `}</style>
        </section>
    );
};
