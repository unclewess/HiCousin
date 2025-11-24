export function Footer() {
    return (
        <footer className="bg-gray-dark text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                            <span className="text-2xl">👋</span>
                            <span className="font-fun text-2xl font-bold">hiCousins</span>
                        </div>
                        <p className="text-gray-light text-sm">
                            Built with ❤️ in Nairobi.
                        </p>
                    </div>

                    <div className="flex gap-8 text-gray-light text-sm">
                        <a href="#" className="hover:text-cousin-pink transition-colors">Privacy</a>
                        <a href="#" className="hover:text-cousin-pink transition-colors">Terms</a>
                        <a href="#" className="hover:text-cousin-pink transition-colors">Twitter</a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-mid/50 text-center text-gray-light text-xs">
                    &copy; {new Date().getFullYear()} hiCousins. All rights reserved. No cousins were harmed in the making of this app.
                </div>
            </div>
        </footer>
    );
}
