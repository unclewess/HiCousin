export function Footer() {
    return (
        <footer className="bg-navy-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                            <span className="text-2xl">👋</span>
                            <span className="font-display text-2xl font-bold">hiCousins</span>
                        </div>
                        <p className="text-navy-300 text-sm">
                            Built with ❤️ in Nairobi.
                        </p>
                    </div>

                    <div className="flex gap-8 text-navy-300 text-sm">
                        <a href="#" className="hover:text-coral-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-coral-400 transition-colors">Terms</a>
                        <a href="#" className="hover:text-coral-400 transition-colors">Twitter</a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-navy-800 text-center text-navy-400 text-xs">
                    &copy; {new Date().getFullYear()} hiCousins. All rights reserved. No cousins were harmed in the making of this app.
                </div>
            </div>
        </footer>
    );
}
