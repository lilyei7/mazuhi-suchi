'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Footer from './Footer'

export default function EmpresaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-condiment">
            Nuestra <span className="text-primary-300">Historia</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una pasión por el sushi de calidad que conquistó el corazón de México
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              El inicio de una gran pasión 🍣
            </h2>
            
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Todo nació a raíz de un joven sinaloense que, al llegar a Querétaro, descubrió 
                una oportunidad única: traer la auténtica tradición del sushi de calidad a esta ciudad llena de posibilidades.
              </p>

              <p>
                Con la pasión que caracteriza a la gente del norte y la visión de crear algo especial, decidió emprender este camino en Querétaro. El objetivo era claro: ofrecer sushi delicioso, fresco y auténtico, manteniendo las técnicas tradicionales que había aprendido en su tierra.
              </p>

              <div className="bg-primary-50 p-6 rounded-lg border-l-4 border-primary-300 my-6">
                <p className="text-lg font-medium text-gray-800 italic">
                  "Querétaro es nuestro hogar y nuestro enfoque. Nuestra meta es ser el mejor restaurante de sushi en Querétaro, compartiendo nuestra pasión y calidad con cada cliente." 🍣
                </p>
              </div>

              <p>
                Desde entonces, nuestra meta ha sido clara: crecer y consolidarnos en Querétaro, compartiendo con cada vez más personas esa experiencia única que solo un sushi hecho con dedicación y amor puede ofrecer.
              </p>

              <p>
                Lo que empezó como un sueño se ha transformado en una realidad que crece día a día, manteniendo siempre nuestro compromiso con la calidad, la frescura y el sabor auténtico. Querétaro es y será siempre el corazón de nuestro proyecto.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              {/* Background image covering the whole container */}
              <Image
                src="/images/angelyeduardo.png"
                alt="La pasión por el sushi"
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 pb-6">
                <div className="text-center relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">Nuestra Pasión</h3>
                  <p className="text-white/90">Sushi de calidad desde el corazón</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-4xl animate-bounce">🍣</div>
              <div className="absolute bottom-4 left-4 text-3xl animate-pulse">🌮</div>
              <div className="absolute top-1/2 left-4 text-2xl animate-bounce delay-300">✨</div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Nuestros <span className="text-secondary-600">Valores</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Calidad Auténtica</h3>
              <p className="text-gray-600">
                Ingredientes frescos y técnicas tradicionales de Sinaloa para garantizar 
                el mejor sabor en cada bocado.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pasión</h3>
              <p className="text-gray-600">
                Cada rollo está hecho con amor y dedicación, porque creemos que la comida 
                debe nutrir tanto el cuerpo como el alma.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunidad</h3>
              <p className="text-gray-600">
                Somos más que un restaurante, somos familia. Queremos que cada cliente 
                se sienta como en casa.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Nuestra <span className="text-primary-300">Misión</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Ser el mejor restaurante de sushi en Querétaro, creando momentos memorables en cada mesa con sabores excepcionales, ingredientes frescos y un servicio que viene del corazón. Porque creemos que la buena comida une a las personas y crea historias que perduran.
          </p>
        </motion.div>

      </div>
    </div>
  )
}