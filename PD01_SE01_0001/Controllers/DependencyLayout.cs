using Microsoft.AspNetCore.Mvc;

namespace PD01_SE01_0001.Controllers
{
    public class DependencyLayout : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Layout1()
        {
            return View();
        }

        public IActionResult Layout2()
        {
            return View();
        }

        public IActionResult Layout3()
        {
            return View();
        }
    }
}
